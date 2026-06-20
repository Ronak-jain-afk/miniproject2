import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { departmentRoutes } from './modules/departments/department.routes';
import { courseRoutes } from './modules/courses/course.routes';
import { semesterRoutes } from './modules/semesters/semester.routes';
import { subjectRoutes } from './modules/subjects/subject.routes';
import { sectionRoutes } from './modules/sections/section.routes';
import { studentRoutes } from './modules/students/student.routes';
import { facultyRoutes } from './modules/faculty/faculty.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(morgan('short'));
app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);

app.use(errorHandler);

export default app;
