export interface ActorConfig {
    actor_config_id: string;
    actor_id: string;
    name: string;
    config_data: Record<string, any>;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CreateActorConfigDto {
    actor_id: string;
    name: string;
    config_data: Record<string, any>;
    is_default?: boolean;
  }
  
  export interface UpdateActorConfigDto {
    name?: string;
    config_data?: Record<string, any>;
    is_default?: boolean;
  }
  
  export interface ActorConfigFilters {
    actor_id?: string;
    is_default?: boolean;
    page?: number;
    limit?: number;
  }