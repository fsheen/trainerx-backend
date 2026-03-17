import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthModule } from '../../modules/auth/auth.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AppPassportModule {}
