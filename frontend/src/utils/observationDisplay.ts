import type { Observation } from '../services/api';

export function getObservationSenderRole(observation: Observation) {
  return observation.senderRole === 'student' ? 'student' : 'professional';
}

export function getObservationSenderLabel(observation: Observation) {
  return getObservationSenderRole(observation) === 'student' ? 'Aluno' : 'Profissional';
}
