const path = require("path");
const express = require("express");
const users = require("../routes/users");
const boards = require("../routes/boards");
const auth = require("../routes/auth");
const Joi = require("joi");
const subjects = require("../routes/subjects");
const syllabusTopics = require("../routes/syllabusTopics");
const resources = require("../routes/resources");
const pastPapers = require("../routes/pastPapers");
const questions = require("../routes/questions");
const studentProgresses = require("../routes/studentProgresses");
const studentProfiles = require("../routes/studentProfiles");
const parentProfiles = require("../routes/parentProfiles");
const teacherProfiles = require("../routes/teacherProfiles");
const classes = require("../routes/classes");
const lessons = require("../routes/lessons");
const assignments = require("../routes/assignments");
const lessonNotes = require("../routes/lessonNotes");
const videos = require("../routes/videos.js");
const quizzes = require("../routes/quizzes.js");
const parentPortal = require("../routes/parentPortal.js");
const attendances = require("../routes/attendances.js");
const results = require("../routes/results.js");
const timeTables = require("../routes/timeTables.js");
const homeworkSubmissions = require("../routes/homeworkSubmissions.js");
const schoolFees = require("../routes/schoolFees.js");
const teacherComments = require("../routes/teacherComments.js");
const studentAnalytics = require("../routes/studentAnalytics.js");
const reportCards = require("../routes/reportCards.js");
const schemeOfWorks = require("../routes/schemeOfWorks.js");
const lessonPlans = require("../routes/lessonPlans.js");
const homeworks = require("../routes/homeWorks.js");
const announcements = require("../routes/announcements.js");
const messages = require("../routes/messages.js");
const communicationNotices = require("../routes/communicationNotices.js");
const attachments = require("../routes/attachments.js");
const libraryResources = require("../routes/libraryResources.js");
const badges = require("../routes/badges.js");
const studentBadges = require("../routes/studentBadges.js");
const certificates = require("../routes/certificates.js");
const forumTopics = require("../routes/forumTopics.js");
const forumPosts = require("../routes/forumPosts.js");
const mockExams = require("../routes/mockExams.js");
const mockExamSubmissions = require("../routes/mockExamSubmissions.js");
const corrections = require("../routes/corrections.js");
const weakTopics = require("../routes/weakTopics.js");
const revisionTasks = require("../routes/revisionTasks.js");
const error = require("../middleware/error");


module.exports = function (app) {
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  Joi.objectId = require("joi-objectid")(Joi);
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static("uploads"));
  




  app.use("/api/auth", auth);
  app.use("/api/attachments",attachments);
  app.use("/api/assignments", assignments);
  app.use("/api/announcements" , announcements);
  app.use("/api/attendances", attendances);

  app.use("/api/boards", boards);
  app.use("/api/badges", badges);

  app.use("/api/certificates", certificates);
  app.use("/api/classes",classes);
  app.use("/api/communicationNotices" , communicationNotices);
  app.use("/api/corrections", corrections);

  app.use("/api/forumTopics", forumTopics);
  app.use("/api/forumPosts", forumPosts);

  app.use("/api/homeworkSubmissions",homeworkSubmissions);
  app.use("/api/homeworks", homeworks);

  app.use("/api/lessons", lessons);
  app.use("/api/lessonNotes", lessonNotes);
  app.use("/api/lessonPlans", lessonPlans);
  app.use("/api/libraryResources", libraryResources);

  app.use("/api/messages", messages);
  app.use("/api/mockExams", mockExams);
  app.use("/api/mockExamSubmissions", mockExamSubmissions);

  app.use("/api/parentProfiles", parentProfiles);
  app.use("/api/parentPortal", parentPortal);
  app.use("/api/pastPapers", pastPapers);

  app.use("/api/questions", questions);
  app.use("/api/quizzes", quizzes); 

  app.use("/api/reportCards",reportCards);
  app.use("/api/results", results);
  app.use("/api/revisionTasks", revisionTasks);

  app.use("/api/studentAnalytics",studentAnalytics);
  app.use("/api/schoolFees", schoolFees);
  app.use("/api/schemeOfWorks",schemeOfWorks);
  app.use("/api/studentProgresses", studentProgresses);
  app.use("/api/studentProfiles" , studentProfiles);
  app.use("/api/subjects", subjects);
  app.use("/api/syllabusTopics", syllabusTopics);
  app.use("/api/studentBadges", studentBadges);

  app.use("/api/teacherProfiles" , teacherProfiles);
  app.use("/api/resources", resources);
  app.use("/api/teacherComments", teacherComments);
  app.use("/api/timeTables", timeTables);

  app.use("/api/users", users);

  app.use("/api/videos",videos);

  app.use("/api/weakTopics",weakTopics);
  
  app.use(error);
};
