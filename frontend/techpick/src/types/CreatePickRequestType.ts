import type { components } from '@/schema';
import type { ConcreteType } from './ConcreteType';

export type CreatePickRequestType = ConcreteType<
  components['schemas']['baguni.api.application.pick.dto.PickApiRequest$Create']
>;
