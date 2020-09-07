import React, { Fragment, useContext, useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Avatar, Card, Paragraph, TouchableRipple } from "react-native-paper";
import axios from "axios";

import { AuthContext } from "../../context/AuthContext";
import { URL } from "../../config";

const ProfileIcon = (props) => (
  <Avatar.Icon {...props} icon="account" size={45} />
);

const AttendanceIcon = (props) => (
  <Avatar.Icon {...props} icon="book" size={45} />
);

const TestIcon = (props) => <Avatar.Icon {...props} icon="file" size={45} />;

const TeacherProfile = ({ navigation }) => {
  const { authState } = useContext(AuthContext);
  const { user } = authState;
  const [className, setClassName] = useState("");
  const getClassName = async () => {
    axios.defaults.headers["auth-token"] = authState.jwt;
    const res = await axios.get(URL + "/class");
    setClassName(res.data.class_.name);
  };
  useEffect(() => {
    getClassName();
  }, [authState]);
  useEffect(() => {
    console.log(className);
  }, [className]);
  return (
    <Fragment>
      <Card style={styles}>
        {/* <TouchableRipple> */}
        <Card.Title title="Profile" subtitle={user.name} left={ProfileIcon} />
        <Card.Content>
          <Paragraph>Email: {user.email}</Paragraph>
          <Paragraph>Class teacher of {className}</Paragraph>
        </Card.Content>
        {/* </TouchableRipple> */}
      </Card>
      <Card style={styles}>
        <TouchableRipple onPress={() => navigation.push("Attendance")}>
          <Card.Title
            title="Attendance"
            subtitle="View Attendance"
            left={AttendanceIcon}
          />
        </TouchableRipple>
      </Card>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  margin: 10,
  marginBottom: 0,
});

export default TeacherProfile;
