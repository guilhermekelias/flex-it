import { DataSource, DataSourceOptions } from 'typeorm';
import { Metric } from '../metrics/entities/metric.entity';
import { NutritionPlan } from '../nutrition-plans/entities/nutrition-plan.entity';
import { Observation } from '../observations/entities/observation.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { Workout } from '../workouts/entities/workout.entity';

const DEFAULT_DB_PORT = 5433;

const databasePort = Number(process.env.DB_PORT ?? DEFAULT_DB_PORT);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.isNaN(databasePort) ? DEFAULT_DB_PORT : databasePort,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '123456',
  database: process.env.DB_DATABASE ?? 'flexit',
  entities: [User, Student, Observation, Workout, Metric, NutritionPlan],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export default new DataSource(dataSourceOptions);
