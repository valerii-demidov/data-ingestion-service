import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://root:root@localhost:27017/buenro?authSource=admin';

@Global()
@Module({
  imports: [MongooseModule.forRoot(MONGO_URI)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
