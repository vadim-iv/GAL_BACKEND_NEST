import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminModule } from 'src/admin/admin.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/config/jwt.config';
import { MembersAuthService } from './members-auth/members-auth.service';
import { MembersAuthController } from './members-auth/members-auth.controller';
import { MembersModule } from 'src/members/members.module';
import { MembersJwtStrategy } from './members-jwt.strategy';

@Module({
  imports: [
    AdminModule, 
    MembersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig
    })
  ],
  controllers: [AuthController, MembersAuthController],
  providers: [AuthService, JwtStrategy, MembersAuthService, MembersJwtStrategy],
})
export class AuthModule {}
