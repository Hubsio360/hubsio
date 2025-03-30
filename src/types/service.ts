
export type ServiceType = 'conseil' | 'audit' | 'rssi_as_service';

export interface Service {
  id: string;
  companyId: string;
  type: ServiceType;
  name?: string;
  startDate: string;
  endDate?: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultingProject {
  id: string;
  serviceId: string;
  name: string;
  scope?: string;
  status: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  frameworkId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RssiService {
  id: string;
  serviceId: string;
  allocationTime: number;
  mainContactName?: string;
  status?: string;
  tasks?: string;
  slaDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}
