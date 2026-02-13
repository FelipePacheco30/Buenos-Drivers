import DriversRepository from '../drivers/repository.js';
import VehiclesRepository from '../vehicles/repository.js';
import DocumentsRepository from '../documents/repository.js';
import RenewalsRepository from './repository.js';
import { broadcastToRole, sendToUser } from '../../config/websocket.js';

function calcDocStatus(expiresAt) {
  const today = new Date();
  const exp = new Date(expiresAt);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'EXPIRED';
  if (diffDays <= 14) return 'EXPIRING';
  return 'VALID';
}

function normalizePlate(input) {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);
}

function isValidPlate(plate) {
  return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(String(plate || ''));
}

function isISODate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return false;
  const d = new Date(`${dateStr}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  
  const [y, m, day] = String(dateStr).split('-').map((n) => Number(n));
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() === m - 1 &&
    d.getUTCDate() === day
  );
}

class RenewalsService {
  async createForDriverUser({ userId, documents, vehicleAdd }) {
    const driver = await DriversRepository.findByUserId(userId);
    if (!driver) throw new Error('DRIVER_NOT_FOUND');

    const docs = Array.isArray(documents) ? documents : [];
    const hasVehicleAdd = !!vehicleAdd;
    if (docs.length === 0 && !hasVehicleAdd) {
      throw new Error('EMPTY_RENEWAL');
    }

    const currentYear = new Date().getFullYear();
    const todayISO = new Date().toISOString().slice(0, 10);

    
    if (hasVehicleAdd) {
      const existing = await VehiclesRepository.findByUserId(userId);
      if ((existing || []).length >= 2) throw new Error('VEHICLE_LIMIT');
    }

    
    const current = await DocumentsRepository.findByDriverId(driver.id);
    const byKey = new Map();
    (current || []).forEach((d) => {
      const key = `${d.type}::${d.vehicle_id || ''}`;
      byKey.set(key, d);
    });

    for (const d of docs) {
      const type = String(d.type || '').trim();
      const vehicleId = d.vehicle_id ? String(d.vehicle_id).trim() : null;
      const key = `${type}::${vehicleId || ''}`;
      const cur = byKey.get(key);
      if (!cur) throw new Error('DOC_NOT_FOUND');
      if (!(cur.status === 'EXPIRING' || cur.status === 'EXPIRED')) {
        throw new Error('DOC_NOT_ELIGIBLE');
      }

      const issuedAt = String(d.issued_at || '').trim();
      const expiresAt = String(d.expires_at || '').trim();
      if (!isISODate(issuedAt) || !isISODate(expiresAt)) throw new Error('DATE_INVALID');
      const issuedYear = Number(issuedAt.slice(0, 4));
      if (issuedYear > currentYear) throw new Error('ISSUED_FUTURE');
      if (issuedAt > todayISO) throw new Error('ISSUED_FUTURE');
      if (expiresAt < issuedAt) throw new Error('EXPIRES_BEFORE_ISSUED');
    }

    if (hasVehicleAdd) {
      const plate = normalizePlate(vehicleAdd.plate);
      const brand = String(vehicleAdd.brand || '').trim();
      const kind = String(vehicleAdd.kind || '').trim().toUpperCase();
      const model = String(vehicleAdd.model || '').trim();
      const year = Number(vehicleAdd.year);
      const color = String(vehicleAdd.color || '').trim();
      const crlvIssuedAt = String(vehicleAdd.crlv_issued_at || '').trim();
      const crlvExpiresAt = String(vehicleAdd.crlv_expires_at || '').trim();

      if (!brand) throw new Error('VEHICLE_BRAND_REQUIRED');
      if (!(kind === 'CAR' || kind === 'MOTO')) throw new Error('VEHICLE_KIND_REQUIRED');
      if (!isValidPlate(plate)) throw new Error('VEHICLE_PLATE_INVALID');
      if (!model || !color) throw new Error('VEHICLE_FIELDS_REQUIRED');
      if (!Number.isFinite(year) || year < 1900 || year > currentYear + 1) throw new Error('VEHICLE_YEAR_INVALID');
      if (!isISODate(crlvIssuedAt) || !isISODate(crlvExpiresAt)) throw new Error('DATE_INVALID');
      const crlvIssuedYear = Number(crlvIssuedAt.slice(0, 4));
      if (crlvIssuedYear > currentYear) throw new Error('ISSUED_FUTURE');
      if (crlvIssuedAt > todayISO) throw new Error('ISSUED_FUTURE');
      if (crlvExpiresAt < crlvIssuedAt) throw new Error('EXPIRES_BEFORE_ISSUED');
    }

    const renewal = await RenewalsRepository.createRenewal({
      driverId: driver.id,
      userId,
    });

    for (const d of docs) {
      await RenewalsRepository.addRenewalDocument({
        renewalId: renewal.id,
        type: String(d.type).trim(),
        vehicleId: d.vehicle_id ? String(d.vehicle_id).trim() : null,
        issuedAt: d.issued_at,
        expiresAt: d.expires_at,
      });
    }

    if (hasVehicleAdd) {
      await RenewalsRepository.addVehicleAdd({
        renewalId: renewal.id,
        plate: normalizePlate(vehicleAdd.plate),
        brand: String(vehicleAdd.brand || '').trim(),
        kind: String(vehicleAdd.kind || 'CAR').trim().toUpperCase(),
        model: String(vehicleAdd.model || '').trim(),
        year: Number(vehicleAdd.year),
        color: String(vehicleAdd.color || '').trim(),
        crlvIssuedAt: String(vehicleAdd.crlv_issued_at || '').trim(),
        crlvExpiresAt: String(vehicleAdd.crlv_expires_at || '').trim(),
      });
    }

    broadcastToRole('ADMIN', { type: 'RENEWAL_CREATED', renewal_id: renewal.id });
    return renewal;
  }

  async listForAdmin() {
    return RenewalsRepository.listForAdmin();
  }

  async getDetailForAdmin(id) {
    const renewal = await RenewalsRepository.getById(id);
    if (!renewal) return null;
    const documents = await RenewalsRepository.listDocumentsByRenewalId(id);
    const vehicleAdd = await RenewalsRepository.getVehicleAddByRenewalId(id);
    return { ...renewal, documents, vehicle_add: vehicleAdd };
  }

  async approve({ id }) {
    const detail = await this.getDetailForAdmin(id);
    if (!detail) throw new Error('RENEWAL_NOT_FOUND');
    if (detail.status !== 'PENDING') throw new Error('RENEWAL_NOT_PENDING');

    
    for (const d of detail.documents || []) {
      const nextStatus = calcDocStatus(d.expires_at);
      await DocumentsRepository.upsert({
        driverId: detail.driver_id,
        vehicleId: d.vehicle_id || null,
        type: d.type,
        issuedAt: d.issued_at,
        expiresAt: d.expires_at,
        status: nextStatus,
      });
    }

    
    if (detail.vehicle_add) {
      const v = detail.vehicle_add;
      const created = await VehiclesRepository.create({
        userId: detail.user_id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        kind: v.kind || 'CAR',
      });

      const crlvStatus = calcDocStatus(v.crlv_expires_at);
      await DocumentsRepository.upsert({
        driverId: detail.driver_id,
        vehicleId: created.id,
        type: 'CRLV',
        issuedAt: v.crlv_issued_at,
        expiresAt: v.crlv_expires_at,
        status: crlvStatus,
      });
    }

    const updated = await RenewalsRepository.setStatus(id, 'APPROVED');

    
    broadcastToRole('ADMIN', { type: 'RENEWAL_UPDATED', renewal_id: id, status: 'APPROVED' });

    
    if (detail.user_id) {
      sendToUser(detail.user_id, {
        type: 'RENEWAL_APPROVED',
        renewal_id: id,
        status: 'APPROVED',
      });
    }

    return updated;
  }
}

export default new RenewalsService();

