import pool from '@/db/pool';
import { Actor, CreateActorDto, UpdateActorDto, ActorFilters } from '@/types/actor';
import logger from '@/config/logger';

/**
 * Get all actors with optional filtering
 */
export const getActors = async (filters: ActorFilters): Promise<{ actors: Actor[]; total: number }> => {
  const { status, tag, author, page = 1, limit = 10 } = filters;
  
  let query = `
    SELECT * FROM actor 
    WHERE 1=1
  `;
  
  const values: any[] = [];
  let paramCount = 1;
  
  // Apply filters
  if (status) {
    query += ` AND status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }
  
  if (author) {
    query += ` AND author = $${paramCount}`;
    values.push(author);
    paramCount++;
  }
  
  if (tag) {
    query += ` AND $${paramCount} = ANY(tags)`;
    values.push(tag);
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
    actors: result.rows,
    total
  };
};

/**
 * Get a single actor by ID
 */
export const getActorById = async (actorId: string): Promise<Actor | null> => {
  const query = 'SELECT * FROM actor WHERE actor_id = $1';
  const result = await pool.query(query, [actorId]);
  
  return result.rows.length ? result.rows[0] : null;
};

/**
 * Create a new actor
 */
export const createActor = async (actorData: CreateActorDto): Promise<Actor> => {
  const { actor_id, name, description, author, version = 1.0, status = 'development', tags = [], risk_profile } = actorData;
  
  const query = `
    INSERT INTO actor 
    (actor_id, name, description, author, version, status, tags, risk_profile) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *
  `;
  
  const values = [
    actor_id,
    name,
    description,
    author,
    version,
    status,
    tags,
    JSON.stringify(risk_profile)
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update an actor
 */
export const updateActor = async (actorId: string, actorData: UpdateActorDto): Promise<Actor | null> => {
  // First, check if the actor exists
  const actor = await getActorById(actorId);
  if (!actor) {
    return null;
  }
  
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  // Build dynamic update query
  if (actorData.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(actorData.name);
  }
  
  if (actorData.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(actorData.description);
  }
  
  if (actorData.author !== undefined) {
    updates.push(`author = $${paramCount++}`);
    values.push(actorData.author);
  }
  
  if (actorData.version !== undefined) {
    updates.push(`version = $${paramCount++}`);
    values.push(actorData.version);
  }
  
  if (actorData.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(actorData.status);
  }
  
  if (actorData.tags !== undefined) {
    updates.push(`tags = $${paramCount++}`);
    values.push(actorData.tags);
  }
  
  if (actorData.risk_profile !== undefined) {
    updates.push(`risk_profile = $${paramCount++}`);
    values.push(JSON.stringify(actorData.risk_profile));
  }
  
  // If no updates, return the existing actor
  if (updates.length === 0) {
    return actor;
  }
  
  // Add actor_id to the values array
  values.push(actorId);
  
  const query = `
    UPDATE actor 
    SET ${updates.join(', ')} 
    WHERE actor_id = $${paramCount} 
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete an actor
 */
export const deleteActor = async (actorId: string): Promise<boolean> => {
  const query = 'DELETE FROM actor WHERE actor_id = $1 RETURNING *';
  const result = await pool.query(query, [actorId]);
  const deletedCount = result.rowCount;
  return !!deletedCount && deletedCount > 0;
};