import pool from '@/db/pool';
import { ActorConfig, CreateActorConfigDto, UpdateActorConfigDto, ActorConfigFilters } from '@/types/actor_config';
import logger from '@/config/logger';

/**
 * Get all actor configs with optional filtering
 */
export const getActorConfigs = async (filters: ActorConfigFilters): Promise<{ configs: ActorConfig[]; total: number }> => {
  const { actor_id, is_default, page = 1, limit = 10 } = filters;
  
  let query = `
    SELECT * FROM actor_config 
    WHERE 1=1
  `;
  
  const values: any[] = [];
  let paramCount = 1;
  
  // Apply filters
  if (actor_id) {
    query += ` AND actor_id = $${paramCount}`;
    values.push(actor_id);
    paramCount++;
  }
  
  if (is_default !== undefined) {
    query += ` AND is_default = $${paramCount}`;
    values.push(is_default);
    paramCount++;
  }
  
  // Get total count
  const countQuery = `SELECT COUNT(*) FROM (${query}) AS count_query`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);
  
  // Apply pagination
  const offset = (page - 1) * limit;
  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);
  
  const result = await pool.query(query, values);
  
  return {
    configs: result.rows,
    total
  };
};

/**
 * Get a single actor config by ID
 */
export const getActorConfigById = async (configId: string): Promise<ActorConfig | null> => {
  const query = 'SELECT * FROM actor_config WHERE actor_config_id = $1';
  const result = await pool.query(query, [configId]);
  
  return result.rows.length ? result.rows[0] : null;
};

/**
 * Get default config for an actor
 */
export const getDefaultConfigForActor = async (actorId: string): Promise<ActorConfig | null> => {
  const query = 'SELECT * FROM actor_config WHERE actor_id = $1 AND is_default = true';
  const result = await pool.query(query, [actorId]);
  
  return result.rows.length ? result.rows[0] : null;
};

/**
 * Create a new actor config
 */
export const createActorConfig = async (configData: CreateActorConfigDto): Promise<ActorConfig> => {
  // Start a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { actor_id, name, config_data, is_default = false } = configData;
    
    // Check if actor exists
    const actorCheck = await client.query('SELECT 1 FROM actor WHERE actor_id = $1', [actor_id]);
    if (actorCheck.rows.length === 0) {
      throw new Error('Actor not found');
    }
    
    // If this config is set as default, unset any existing default for this actor
    if (is_default) {
      await client.query(
        'UPDATE actor_config SET is_default = false WHERE actor_id = $1 AND is_default = true',
        [actor_id]
      );
    }
    
    // Insert the new config
    const query = `
      INSERT INTO actor_config 
      (actor_id, name, config_data, is_default) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const result = await client.query(query, [
      actor_id,
      name,
      JSON.stringify(config_data),
      is_default
    ]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Error creating actor config: ${error}`);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an actor config
 */
export const updateActorConfig = async (configId: string, configData: UpdateActorConfigDto): Promise<ActorConfig | null> => {
  // First, check if the config exists
  const existingConfig = await getActorConfigById(configId);
  if (!existingConfig) {
    return null;
  }
  
  // Start a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // If setting this as default, unset any existing default
    if (configData.is_default && !existingConfig.is_default) {
      await client.query(
        'UPDATE actor_config SET is_default = false WHERE actor_id = $1 AND is_default = true',
        [existingConfig.actor_id]
      );
    }
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    if (configData.name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(configData.name);
    }
    
    if (configData.config_data !== undefined) {
      updates.push(`config_data = $${paramCounter++}`);
      values.push(JSON.stringify(configData.config_data));
    }
    
    if (configData.is_default !== undefined) {
      updates.push(`is_default = $${paramCounter++}`);
      values.push(configData.is_default);
    }
    
    // If nothing to update, return the existing record
    if (updates.length === 0) {
      await client.query('COMMIT');
      return existingConfig;
    }
    
    // Add ID parameter
    values.push(configId);
    
    const query = `
      UPDATE actor_config 
      SET ${updates.join(', ')} 
      WHERE actor_config_id = $${paramCounter} 
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Error updating actor config: ${error}`);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete an actor config
 */
export const deleteActorConfig = async (configId: string): Promise<boolean> => {
  // Check if this config is used in other tables
  const usageCheck = await Promise.all([
    pool.query('SELECT 1 FROM backtest_result WHERE actor_config_id = $1 LIMIT 1', [configId]),
    pool.query('SELECT 1 FROM live_trade WHERE actor_config_id = $1 LIMIT 1', [configId])
  ]);
  
  // If used in other tables, don't delete
  if (usageCheck[0].rows.length > 0 || usageCheck[1].rows.length > 0) {
    throw new Error('Cannot delete configuration that is in use by backtest results or live trades');
  }
  
  const query = 'DELETE FROM actor_config WHERE actor_config_id = $1 RETURNING *';
  const result = await pool.query(query, [configId]);
  const deletedCount = result.rowCount;
  return !!deletedCount && deletedCount > 0;
};