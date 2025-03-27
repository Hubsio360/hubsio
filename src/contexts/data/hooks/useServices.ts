
import { useState, useEffect, useCallback } from 'react';
import { Service, ConsultingProject, RssiService } from '@/types';
import { supabase, checkAuth } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [consultingProjects, setConsultingProjects] = useState<ConsultingProject[]>([]);
  const [rssiServices, setRssiServices] = useState<RssiService[]>([]);
  const [loading, setLoading] = useState({
    services: true,
    consultingProjects: true,
    rssiServices: true
  });
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Récupération des services
  const fetchServices = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        console.log('Utilisateur non authentifié, impossible de récupérer les services');
        setServices([]);
        setLoading(prev => ({ ...prev, services: false }));
        return;
      }
      
      setLoading(prev => ({ ...prev, services: true }));
      console.log('Récupération des services...');
      
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) {
        console.error('Erreur lors de la récupération des services:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les services: " + error.message,
          variant: "destructive",
        });
        setLoading(prev => ({ ...prev, services: false }));
        return;
      }

      console.log('Services récupérés:', data);
      const formattedServices: Service[] = data.map(item => ({
        id: item.id,
        companyId: item.company_id,
        type: item.type,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        description: item.description,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      setServices(formattedServices);
      setLoading(prev => ({ ...prev, services: false }));
    } catch (error) {
      console.error('Erreur dans fetchServices:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des services",
        variant: "destructive",
      });
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, [isAuthenticated, toast]);

  // Récupération des projets de conseil
  const fetchConsultingProjects = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        console.log('Utilisateur non authentifié, impossible de récupérer les projets de conseil');
        setConsultingProjects([]);
        setLoading(prev => ({ ...prev, consultingProjects: false }));
        return;
      }
      
      setLoading(prev => ({ ...prev, consultingProjects: true }));
      console.log('Récupération des projets de conseil...');
      
      const { data, error } = await supabase
        .from('consulting_projects')
        .select('*');
      
      if (error) {
        console.error('Erreur lors de la récupération des projets de conseil:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les projets de conseil: " + error.message,
          variant: "destructive",
        });
        setLoading(prev => ({ ...prev, consultingProjects: false }));
        return;
      }

      console.log('Projets de conseil récupérés:', data);
      const formattedProjects: ConsultingProject[] = data.map(item => ({
        id: item.id,
        serviceId: item.service_id,
        name: item.name,
        scope: item.scope,
        status: item.status,
        frameworkId: item.framework_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      setConsultingProjects(formattedProjects);
      setLoading(prev => ({ ...prev, consultingProjects: false }));
    } catch (error) {
      console.error('Erreur dans fetchConsultingProjects:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des projets de conseil",
        variant: "destructive",
      });
      setLoading(prev => ({ ...prev, consultingProjects: false }));
    }
  }, [isAuthenticated, toast]);

  // Récupération des services RSSI
  const fetchRssiServices = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        console.log('Utilisateur non authentifié, impossible de récupérer les services RSSI');
        setRssiServices([]);
        setLoading(prev => ({ ...prev, rssiServices: false }));
        return;
      }
      
      setLoading(prev => ({ ...prev, rssiServices: true }));
      console.log('Récupération des services RSSI...');
      
      const { data, error } = await supabase
        .from('rssi_services')
        .select('*');
      
      if (error) {
        console.error('Erreur lors de la récupération des services RSSI:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les services RSSI: " + error.message,
          variant: "destructive",
        });
        setLoading(prev => ({ ...prev, rssiServices: false }));
        return;
      }

      console.log('Services RSSI récupérés:', data);
      const formattedRssiServices: RssiService[] = data.map(item => ({
        id: item.id,
        serviceId: item.service_id,
        allocationTime: item.allocation_time,
        mainContactName: item.main_contact_name,
        status: item.status,
        slaDetails: item.sla_details,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      setRssiServices(formattedRssiServices);
      setLoading(prev => ({ ...prev, rssiServices: false }));
    } catch (error) {
      console.error('Erreur dans fetchRssiServices:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des services RSSI",
        variant: "destructive",
      });
      setLoading(prev => ({ ...prev, rssiServices: false }));
    }
  }, [isAuthenticated, toast]);

  // Chargement initial des données
  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
      fetchConsultingProjects();
      fetchRssiServices();
    }
  }, [isAuthenticated, fetchServices, fetchConsultingProjects, fetchRssiServices]);

  // Ajout d'un nouveau service
  const addService = async (service: Omit<Service, 'id'>): Promise<Service> => {
    try {
      console.log('Ajout d\'un nouveau service:', service);
      
      const session = await checkAuth();
      if (!session) {
        console.error('Tentative d\'ajout d\'un service sans authentification');
        throw new Error("Vous devez être connecté pour ajouter un service");
      }
      
      const serviceData = {
        company_id: service.companyId,
        type: service.type,
        start_date: service.startDate,
        end_date: service.endDate || null,
        status: service.status,
        description: service.description || null,
      };
      
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de l\'ajout du service:', error);
        throw new Error(`Erreur lors de l'ajout du service: ${error.message}`);
      }

      console.log('Service ajouté avec succès:', data);
      const newService: Service = {
        id: data.id,
        companyId: data.company_id,
        type: data.type,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error) {
      console.error('Erreur dans addService:', error);
      throw error;
    }
  };

  // Ajout d'un nouveau projet de conseil
  const addConsultingProject = async (project: Omit<ConsultingProject, 'id'>): Promise<ConsultingProject> => {
    try {
      console.log('Ajout d\'un nouveau projet de conseil:', project);
      
      const session = await checkAuth();
      if (!session) {
        console.error('Tentative d\'ajout d\'un projet sans authentification');
        throw new Error("Vous devez être connecté pour ajouter un projet");
      }
      
      const projectData = {
        service_id: project.serviceId,
        name: project.name,
        scope: project.scope || null,
        status: project.status,
        framework_id: project.frameworkId || null,
      };
      
      const { data, error } = await supabase
        .from('consulting_projects')
        .insert(projectData)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de l\'ajout du projet de conseil:', error);
        throw new Error(`Erreur lors de l'ajout du projet de conseil: ${error.message}`);
      }

      console.log('Projet de conseil ajouté avec succès:', data);
      const newProject: ConsultingProject = {
        id: data.id,
        serviceId: data.service_id,
        name: data.name,
        scope: data.scope,
        status: data.status,
        frameworkId: data.framework_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setConsultingProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Erreur dans addConsultingProject:', error);
      throw error;
    }
  };

  // Ajout d'un nouveau service RSSI
  const addRssiService = async (rssiService: Omit<RssiService, 'id'>): Promise<RssiService> => {
    try {
      console.log('Ajout d\'un nouveau service RSSI:', rssiService);
      
      const session = await checkAuth();
      if (!session) {
        console.error('Tentative d\'ajout d\'un service RSSI sans authentification');
        throw new Error("Vous devez être connecté pour ajouter un service RSSI");
      }
      
      const rssiData = {
        service_id: rssiService.serviceId,
        allocation_time: rssiService.allocationTime,
        main_contact_name: rssiService.mainContactName || null,
        status: rssiService.status,
        sla_details: rssiService.slaDetails || null,
      };
      
      const { data, error } = await supabase
        .from('rssi_services')
        .insert(rssiData)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de l\'ajout du service RSSI:', error);
        throw new Error(`Erreur lors de l'ajout du service RSSI: ${error.message}`);
      }

      console.log('Service RSSI ajouté avec succès:', data);
      const newRssiService: RssiService = {
        id: data.id,
        serviceId: data.service_id,
        allocationTime: data.allocation_time,
        mainContactName: data.main_contact_name,
        status: data.status,
        slaDetails: data.sla_details,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setRssiServices(prev => [...prev, newRssiService]);
      return newRssiService;
    } catch (error) {
      console.error('Erreur dans addRssiService:', error);
      throw error;
    }
  };

  // Récupération des services par companyId
  const getServicesByCompanyId = (companyId: string): Service[] => {
    return services.filter(service => service.companyId === companyId);
  };

  // Récupération des projets de conseil par serviceId
  const getConsultingProjectsByServiceId = (serviceId: string): ConsultingProject[] => {
    return consultingProjects.filter(project => project.serviceId === serviceId);
  };

  // Récupération des services RSSI par serviceId
  const getRssiServicesByServiceId = (serviceId: string): RssiService | undefined => {
    return rssiServices.find(rssiService => rssiService.serviceId === serviceId);
  };

  return {
    services,
    consultingProjects,
    rssiServices,
    loading: {
      services: loading.services,
      consultingProjects: loading.consultingProjects,
      rssiServices: loading.rssiServices
    },
    fetchServices,
    fetchConsultingProjects,
    fetchRssiServices,
    addService,
    addConsultingProject,
    addRssiService,
    getServicesByCompanyId,
    getConsultingProjectsByServiceId,
    getRssiServicesByServiceId
  };
};
