import { Priority } from '../models/enums';
import { addDays } from './dateUtils';

export function getSlaDeadlineDays(priority: Priority): number {
  const daysMap: Record<Priority, number> = {
    [Priority.LOW]: 14,
    [Priority.MEDIUM]: 7,
    [Priority.HIGH]: 4,
    [Priority.CRITICAL]: 2,
  };
  return daysMap[priority];
}

export function getSlaDeadline(priority: Priority, createdAt: Date = new Date()): Date {
  return addDays(createdAt, getSlaDeadlineDays(priority));
}

export function getEstimatedResolutionDays(priority: Priority): number {
  const map: Record<Priority, number> = {
    [Priority.LOW]: 10,
    [Priority.MEDIUM]: 5,
    [Priority.HIGH]: 4,
    [Priority.CRITICAL]: 2,
  };
  return map[priority];
}
