const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const router = express.Router();

const { trimObj, genRandPass } = require("../utils/common");
const auth = require("../middleware/auth");
const { admin, teacher } = require("../middleware/rank");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Admin = require("../models/Admin");
const Otp = require("../models/Otp");
const { findOne, findOneAndUpdate } = require("../models/Student");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.get("/homie/testing", (req, res) => {
  res.json({ msg: "hello homie" });
});

router.get("/students/all", auth, admin, async (req, res) => {
  try {
    const students = await Student.find();

    return res.status(200).json({
      sucess: true,
      data: students,
    });
  } catch (err) {
    return res.status(404).json({
      sucess: false,
      error: err,
    });
  }
});

router.get("/teachers/all", auth, admin, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    console.log(teachers);

    return res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (err) {
    return res.status(404).json({
      sucess: false,
      error: err,
    });
  }
});

router.get("/initial", auth, async (req, res) => {
  try {
    let student = await Student.findById(req.body.data.id);
    if (student) {
      let cls = await Class.findById(student.studentClass);
      student = student.toJSON();
      delete student.password;
      student.className = cls.name;
      console.log(cls.name, student.className);
      return res.json({
        student,
      });
    }
    student = await Teacher.findById(req.body.data._id);
    if (student) {
      let cls = await Class.findById(student.teacherClass);
      student = student.toJSON();
      delete student.password;
      if (cls) {
        student.className = cls.name;
      }
      return res.json({
        student,
      });
    }
    student = await Admin.findById(req.body.data.id);
    if (student) {
      return res.json({
        student,
      });
    }
  } catch (err) {
    return res.json({ status: "bad" });
    console.log(err);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    student = student.toJSON();
    delete student.password;
    return res.json({
      student,
    });
  } catch (err) {
    return res.status(404).json({
      err,
    });
  }
});

router.get("/teacher/:teacherId", auth, teacher, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId);
    console.log(teacher);
    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    return res.status(404).json({
      sucess: false,
      error: err,
    });
  }
});

router.post("/update/student", auth, admin, async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const student = await Student.findById(studentId);

    if (req.body.classId) {
      const oldClass = await Class.findById(student.studentClass);
      oldClass.students = oldClass.students.filter((student_) => {
        if (student_.student != student.id) {
          return student_;
        }
      });
      oldClass.save();

      const class_ = await Class.findById(req.body.classId);
      class_.students.push({ student: student.id });
      class_.save();
    }

    const newStudent = await student.updateOne({
      name: req.body.name || student.name,
      email: req.body.email || student.email,
      studentClass: req.body.classId || student.studentClass,
      info: req.body.info || student.info,
    });
    student.save();
    return res.status(201).json({
      sucess: true,
      student: newStudent,
    });
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});

router.post("/update/teacher", auth, admin, async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    const teacher = await Teacher.findById(teacherId);

    const newTeacher = await Teacher.updateOne({
      name: req.body.name || teacher.name,
      email: req.body.email || teacher.email,
    });

    return res.status(201).json({
      success: true,
      teacher: newTeacher,
    });
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});

router.post("/add", async (req, res) => {
  let obj = req.body;
  obj = JSON.parse(JSON.stringify(obj).replace(/"\s+|\s+"/g, '"'));
  const { firstName, lastName, email, rank, studentClass, teacherClass, info } =
    obj;
  const stu = await Student.findOne({ email });
  const tea = await Teacher.findOne({ email });
  if (stu || tea) {
    res.status(400).json({ msg: "User already exists" });
  } else {
    const name = firstName + " " + lastName;
    let password = genRandPass();
    console.log(`password: ${password}`);
    const tempPass = genRandPass();

    let mailInfo = await transporter.sendMail({
      from: "jmrd@jmrd.com",
      to: email,
      subject: "Your password for JMRD School App",
      html: `<p>Your password for the app is <b>${tempPass}</b></p>`,
    });

    console.log("Message sent: %s", mailInfo.messageId);

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(tempPass, salt);
    if (rank === "0") {
      const student = new Student({
        name,
        email,
        studentClass,
        password,
        info,
      });

      const class_ = await Class.findById(studentClass);
      class_.students.push({ student: student.id });
      class_.save();

      await student.save();
      const payload = {
        data: {
          id: student.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      res.json({ token, name, email, rank, _id: student.id });
    } else if (rank === "1") {
      const teacher = new Teacher({
        name,
        email,
        password,
        teacherClass,
        info,
      });
      await teacher.save();
      const payload = {
        data: {
          id: teacher.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      res.json({ token, name, email, rank });
    } else if (rank === "2") {
      const admin = new Admin({ name, email, password, rank });
      console.log("ADMIN", admin);
      await admin.save();
      const payload = {
        data: {
          id: admin.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      res.json({ token, name, email, rank });
    }
  }
});

router.post("/stu/changepassword", auth, async (req, res) => {
  const { _id, newPass, oldPass } = req.body;
  let user = await Student.findById(_id);
  if (user) {
    const verified = await bcrypt.compare(oldPass, user.password);
    if (verified) {
      const salt = await bcrypt.genSalt();
      const newPassSave = await bcrypt.hash(newPass, salt);
      const updated = await Student.findByIdAndUpdate(_id, {
        password: newPassSave,
      });
      res.json({ success: "true" });
    } else {
      res.status(400).json({ error: "Incorrect password" });
    }
  } else {
    res.status(400).json({ error: "User does not exist" });
  }
});

router.post("/tea/changepassword", auth, teacher, async (req, res) => {
  const { _id, newPass, oldPass } = req.body;
  let user = await Teacher.findById(_id);
  if (user) {
    const verified = await bcrypt.compare(oldPass, user.password);
    console.log(verified);
    if (verified) {
      const salt = await bcrypt.genSalt();
      const newPassSave = await bcrypt.hash(newPass, salt);
      const updated = await Teacher.findByIdAndUpdate(_id, {
        password: newPassSave,
      });
      res.json({ success: "true" });
    } else {
      res.status(400).json({ error: "Incorrect password" });
    }
  } else {
    res.status(400).json({ error: "User does not exist" });
  }
});

router.post("/adm/changepassword", auth, admin, async (req, res) => {
  const { _id, newPass, oldPass } = req.body;
  let user = await Admin.findById(_id);
  if (user) {
    const verified = await bcrypt.compare(oldPass, user.password);
    console.log(verified);
    if (verified) {
      const salt = await bcrypt.genSalt();
      const newPassSave = await bcrypt.hash(newPass, salt);
      const updated = await Admin.findByIdAndUpdate(_id, {
        password: newPassSave,
      });
      res.json({ success: "true" });
    } else {
      res.status(400).json({ error: "Incorrect password" });
    }
  } else {
    res.status(400).json({ error: "User does not exist" });
  }
});

router.post("/forgot/initial", async (req, res) => {
  const { email } = req.body;
  let userType;
  let user = await Student.findOne({ email });
  if (user) {
    let otpStr = Math.floor(100000 + Math.random() * 900000);
    const dt = new Date();
    const otp = new Otp({
      userId: user.id,
      otpStr,
      date: dt,
    });
    otp.save();
    let mailInfo = await transporter.sendMail({
      from: "jmrd@jmrd.com",
      to: email,
      subject: "Your OTP - JMRD",
      html: `<p>Your 6-digit OTP is <b>${otp.otpStr}</b>, valid for 5 minutes.</p>`,
    });
    userType = "student";
    res.json({ _id: user.id, userType });
    console.log("Message sent: %s", mailInfo.messageId);
  }
  user = await Teacher.findOne({ email });
  if (user) {
    let otpStr = Math.floor(100000 + Math.random() * 900000);
    const dt = new Date();
    const otp = new Otp({
      userId: user.id,
      otpStr,
      date: dt,
    });
    otp.save();
    let mailInfo = await transporter.sendMail({
      from: "jmrd@jmrd.com",
      to: email,
      subject: "Your OTP - JMRD",
      html: `<p>Your 6-digit OTP is <b>${otp.otpStr}</b>, valid for 5 minutes.</p>`,
    });
    userType = "teacher";
    res.json({ _id: user.id, userType });
    console.log("Message sent: %s", mailInfo.messageId);
  } else {
    res.status(400).json({ error: "User does not exist" });
  }
});

router.post("/forgot/verify", async (req, res) => {
  const { otpStr, _id, userType, email } = req.body;
  const otp = await Otp.findOne({ userId: _id, otpStr });
  const timeNow = new Date();
  const otpTime = new Date(otp.date);
  let timeDiff = timeNow - otpTime;
  console.log(timeDiff);
  if (timeDiff < 5 * 60 * 1000 && otpStr === otp.otpStr) {
    const newPass = genRandPass();
    const salt = await bcrypt.genSalt();
    const newPassSave = await bcrypt.hash(newPass, salt);
    const updated =
      userType === "student"
        ? await Student.findByIdAndUpdate(
            _id,
            {
              password: newPassSave,
            },
            { useFindAndModify: false }
          )
        : await Teacher.findByIdAndUpdate(
            _id,
            {
              password: newPassSave,
            },
            { useFindAndModify: false }
          );
    let mailInfo = await transporter.sendMail({
      from: "jmrd@jmrd.com",
      to: email,
      subject: "Your New Password - JMRD",
      html: `<p>Your new password is <b>${newPass}</b></p>`,
    });
    console.log("Message sent: %s", mailInfo.messageId);
    res.json({ success: "true" });
  } else {
    res.status(400).json({ error: "invalid/expired OTP" });
  }
});

router.post("/login", async (req, res) => {
  let obj = req.body;
  obj = trimObj(obj);
  const { email, password } = obj;
  if (!email || !password) {
    res.status(400).json({ msg: "Invalid credentials" });
    return;
  }
  let user = await Student.findOne({ email });
  if (user) {
    const { name, rank, studentClass } = user;
    const passMatches = await bcrypt.compare(password, user.password);
    if (passMatches) {
      const payload = {
        data: {
          id: user.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      const { id } = user;
      return res.json({ token, name, email, rank, studentClass, id });
    }
  }
  user = await Teacher.findOne({ email });
  if (user) {
    console.log("hi teacher");
    const { name, rank, teacherClass } = user;
    const passMatches = await bcrypt.compare(password, user.password);
    if (passMatches) {
      const payload = {
        data: {
          id: user.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      return res.json({ token, name, email, rank, teacherClass });
    }
  }
  user = await Admin.findOne({ email });
  if (user) {
    console.log("hi admin");
    const { name, rank } = user;
    console.log("USER BOI", user, obj);
    const passMatches = await bcrypt.compare(password, user.password);
    // const passMatches = password === user.password;
    console.log("PAS MATCH", passMatches);
    if (passMatches) {
      const payload = {
        data: {
          id: user.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      return res.json({ token, name, email, rank });
    }
  } else {
    return res.status(400).json({ msg: "Invalid credentials" });
  }
});

module.exports = router;
