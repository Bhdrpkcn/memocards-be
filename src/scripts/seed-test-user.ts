import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const users = app.get(UserService);

  const email = 'test@memocards.app';
  const name = 'Test User';

  const user = await users.findOrCreateByEmail(email, name);

  console.log('✅ Test user hazır:');
  console.log('   id   =', user.id);
  console.log('   email=', user.email);

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
