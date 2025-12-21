import { Observable } from 'rxjs';
import type { Command } from './command';

/**
 * Interface for command providers that supply commands to the palette.
 * Implement this interface to register custom command sources.
 */
export interface CommandProvider {
  /** Unique identifier for this provider */
  id: string;
  /** Human-readable name for this provider's commands category */
  name: string;
  /**
   * Search for commands matching the given query.
   * @param query The search query string
   * @returns Observable emitting matching commands
   */
  search(query: string): Observable<Command[]>;
}

