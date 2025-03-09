export interface Parameter {
    parameter_id: string;
    actor_id: string;
    name: string;
    parameters: Record<string, any>;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CreateParameterDto {
    actor_id: string;
    name: string;
    parameters: Record<string, any>;
    is_default?: boolean;
  }
  
  export interface UpdateParameterDto {
    name?: string;
    parameters?: Record<string, any>;
    is_default?: boolean;
  }
  
  export interface ParameterFilters {
    actor_id?: string;
    is_default?: boolean;
    page?: number;
    limit?: number;
  }