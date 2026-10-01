/**
 * Public API of the identity module. Other modules may import ONLY from here.
 * Identity owns accounts, authentication and the global JWT guard.
 */
export { IdentityModule } from './identity.module';
export { CurrentUser } from './http/decorators/current-user.decorator';
export { Public } from './http/decorators/public.decorator';
