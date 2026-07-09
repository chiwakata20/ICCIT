const express = require("express");
const router = express.Router();

const { User } = require("../models/user");
const { TeacherProfile } = require("../models/teacherProfile");
const { LessonNote } = require("../models/lessonNote");
const { Video } = require("../models/video");
const { Quiz } = require("../models/quiz");
const { MockExam } = require("../models/mockExam");
const { RevisionTask } = require("../models/revisionTask");
const { StudentAnalytics } = require("../models/studentAnalytic");
const { TeacherComment } = require("../models/teacherComment");
const { WeakTopic } = require("../models/weakTopic");
const { StudentProfile } = require("../models/studentProfile");

// TEACHER DASHBOARD
router.get("/:teacherId", async (req, res) => {
  const teacher = await User.findById(req.params.teacherId).select("-password");

  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const profile = await TeacherProfile.findOne({
    user: req.params.teacherId,
  })
    .populate("user", "name email role")
    .populate("subjects", "name code level category")
    .populate("classes", "name syllabus");

  if (!profile) return res.status(404).send("Teacher profile not found.");

  const classIds = profile.classes.map((item) => item._id);
  const subjectIds = profile.subjects.map((item) => item._id);

  const notes = await LessonNote.find()
    .populate({
      path: "lesson",
      select: "title subject class teacher",
      populate: [
        { path: "subject", select: "name code level category" },
        { path: "class", select: "name syllabus" },
        { path: "teacher", select: "name email role" },
      ],
    })
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  const teacherNotes = notes.filter(
    (note) =>
      note.lesson &&
      note.lesson.teacher &&
      note.lesson.teacher._id.toString() === req.params.teacherId
  );

  const videos = await Video.find()
    .populate({
      path: "lesson",
      select: "title subject class teacher",
      populate: [
        { path: "subject", select: "name code level category" },
        { path: "class", select: "name syllabus" },
        { path: "teacher", select: "name email role" },
      ],
    })
    .sort("-createdAt");

  const teacherVideos = videos.filter(
    (video) =>
      video.lesson &&
      video.lesson.teacher &&
      video.lesson.teacher._id.toString() === req.params.teacherId
  );

  const quizzes = await Quiz.find({
    teacher: req.params.teacherId,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .sort("-createdAt");

  const mockExams = await MockExam.find({
    teacher: req.params.teacherId,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("questions")
    .sort("-createdAt");

  const students = await StudentProfile.find({
    class: { $in: classIds },
  })
    .populate("user", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects", "name code level category");

  const studentIds = students.map((item) => item.user._id);

  const revisionTasks = await RevisionTask.find({
    student: { $in: studentIds },
    subject: { $in: subjectIds },
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  const analytics = await StudentAnalytics.find({
    student: { $in: studentIds },
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjectPerformances.subject", "name code level category")
    .populate("weakSubjects", "name code")
    .populate("strongSubjects", "name code")
    .sort("-createdAt");

  const comments = await TeacherComment.find({
    teacher: req.params.teacherId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .sort("-createdAt");

  const weakTopics = await WeakTopic.find({
    student: { $in: studentIds },
    subject: { $in: subjectIds },
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send({
    teacher: profile,

    uploads: {
      notes: teacherNotes,
      videos: teacherVideos,
    },

    assessments: {
      quizzes,
      mockExams,
    },

    students,

    revisionTasks,

    performance: {
      analytics,
      weakTopics,
    },

    teacherComments: comments,

    summary: {
      totalClasses: profile.classes.length,
      totalSubjects: profile.subjects.length,
      totalStudents: students.length,
      totalNotes: teacherNotes.length,
      totalVideos: teacherVideos.length,
      totalQuizzes: quizzes.length,
      totalMockExams: mockExams.length,
      totalRevisionTasks: revisionTasks.length,
      totalWeakTopicReports: weakTopics.length,
      totalComments: comments.length,
    },

    actionEndpoints: {
      uploadNotes: "POST /api/lessonnotes",
      uploadVideos: "POST /api/videos",
      createQuiz: "POST /api/quizzes",
      createMockExam: "POST /api/mockexams",
      assignRevisionTask: "POST /api/revisiontasks",
      viewStudentPerformance: "GET /api/studentanalytics/student/:studentId",
      commentOnProgress: "POST /api/teachercomments",
      identifyWeakTopics: "GET /api/weaktopics/student/:studentId",
    },
  });
});

module.exports = router;