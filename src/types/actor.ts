export interface RiskProfile {
    maxDrawdown: number;
    sharpeTarget: number;
    maxPositionSize: number;
  }
  
  export type ActorStatus = 'active' | 'archived' | 'development';
  
  export interface Actor {
    actor_id: string;
    name: string;
    description: string;
    author: string;
    version: number;
    status: ActorStatus;
    tags: string[];
    risk_profile: RiskProfile;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CreateActorDto {
    actor_id: string;
    name: string;
    description: string;
    author: string;
    version?: number;
    status?: ActorStatus;
    tags?: string[];
    risk_profile: RiskProfile;
  }
  
  export interface UpdateActorDto {
    name?: string;
    description?: string;
    author?: string;
    version?: number;
    status?: ActorStatus;
    tags?: string[];
    risk_profile?: RiskProfile;
  }
  
  export interface ActorFilters {
    status?: ActorStatus;
    tag?: string;
    author?: string;
    page?: number;
    limit?: number;
  }