const express = require('express');
const jobController = require('../controllers/job.controller');
const partController = require('../controllers/part.controller');
const imageController = require('../controllers/image.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { uploadMultipleImages } = require('../middleware/upload.middleware');
const { ROLES } = require('../utils/constants');

const {
  createJobSchema,
  updateJobSchema,
  assignWorkerSchema,
  listJobsQuerySchema,
  jobIdParamSchema,
  jobParamIdSchema,
} = require('../validators/job.validator');

const {
  addPartSchema,
  updatePartSchema,
  partIdParamSchema,
} = require('../validators/part.validator');

const router = express.Router();

router.use(authenticate);

router.get(
  '/completed',
  authorizeRoles(ROLES.ADMIN),
  jobController.getCompletedJobs
);

router.post(
  '/',
  authorizeRoles(ROLES.ADMIN),
  validate(createJobSchema, 'body'),
  jobController.createJob
);

router.get(
  '/',
  validate(listJobsQuerySchema, 'query'),
  jobController.getJobs
);

router.get(
  '/:id',
  validate(jobIdParamSchema, 'params'),
  jobController.getJobById
);

router.patch(
  '/:id',
  validate(jobIdParamSchema, 'params'),
  validate(updateJobSchema, 'body'),
  jobController.updateJob
);

router.delete(
  '/:id',
  authorizeRoles(ROLES.ADMIN),
  validate(jobIdParamSchema, 'params'),
  jobController.deleteJob
);
// --------------------------------------------------
router.post(
  '/:jobId/assign',
  authorizeRoles(ROLES.ADMIN),
  validate(jobParamIdSchema, 'params'),
  validate(assignWorkerSchema, 'body'),
  jobController.assignWorker
);

router.post(
  '/:jobId/parts',
  validate(jobParamIdSchema, 'params'),
  validate(addPartSchema, 'body'),
  partController.addPart
);

router.get(
  '/:jobId/parts',
  validate(jobParamIdSchema, 'params'),
  partController.getParts
);

router.patch(
  '/:jobId/parts/:partId',
  validate(partIdParamSchema, 'params'),
  validate(updatePartSchema, 'body'),
  partController.updatePart
);

router.delete(
  '/:jobId/parts/:partId',
  validate(partIdParamSchema, 'params'),
  partController.deletePart
);

router.post(
  '/:jobId/images',
  validate(jobParamIdSchema, 'params'),
  uploadMultipleImages,
  imageController.uploadImages
);

router.get(
  '/:jobId/images',
  validate(jobParamIdSchema, 'params'),
  imageController.getImages
);

router.delete(
  '/:jobId/images/:imageId',
  imageController.deleteImage
);

module.exports = router;
