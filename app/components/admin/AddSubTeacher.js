import React, { Fragment, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Headline, TextInput, Button, FAB } from "react-native-paper";
import { Formik } from "formik";
import SearchableDropdown from 'react-native-searchable-dropdown';

import globalStyles from "../styles/global";
import AddClass from "./AddClass";
import adminStyles from './AdminStyles';
import {AdminContext} from '../../context/AdminContext';

const AddClassTeacher = ({ addClassTeacher, classTeacherModalOpen, setClassTeacherModalOpen, navigation }) => {

    const { adminState, currClass, getTeachers } = React.useContext(AdminContext);
    
    useEffect(() => {
        getTeachers();
        console.log(adminState);
    }, [])

    var teachers = adminState.teachers.map((teacher) => {
        return({
            teacherId: teacher._id,
            name: teacher.name
        })
    });

    return (
        <Modal visible={classTeacherModalOpen} animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={adminStyles.modalContent}>
                <FAB
                    style={adminStyles.fab}
                    icon="backburger"
                    onPress={() => setClassTeacherModalOpen(false)}
                />
                <Fragment>
                <Text></Text>
                    <Headline style={globalStyles.headline}>Add Class Teacher</Headline>
                    <Text></Text>
                    <Text></Text>
                    <Formik 
                        initialValues={{ classTeacher: "", class: currClass }}
                        onSubmit={(values, actions) => {
                            actions.resetForm();
                            addClassTeacher(values);                  // SUMITTING CLASS VALUE
                            setClassTeacherModalOpen(false);
                            navigation.navigate('ClassView');
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values }) => (
                            <View style={globalStyles.view}>
                                <SearchableDropdown 
                                    items={teachers}
                                    textInputProps={
                                    {
                                        placeholder: "Choose Class",
                                        underlineColorAndroid: "transparent",
                                        style: {
                                            marginTop: 15,
                                            padding: 12,
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            borderRadius: 5,
                                        },
                                        onTextChange: text => console.log(text)
                                    }
                                    }
                                    onItemSelect={(item) => {
                                        values.classTeacher = item.teacherId;
                                    }}
                                    containerStyle={{ padding: 1 }}
                                    itemStyle={{
                                        padding: 10,
                                        marginTop: 2,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 1,
                                        borderRadius: 5,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 200 }}
                                />
                                <Button
                                    style={{ marginTop: 15 }}
                                    onPress={handleSubmit}
                                    title="Submit"
                                    mode="contained"
                                >
                                    Submit
                                </Button>
                            </View>
                        )}
                    </Formik>
                </Fragment>
            </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default AddClassTeacher;