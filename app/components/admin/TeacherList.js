import * as React from "react";
import { View, Text } from "react-native";
import { Avatar, Button, Card, Searchbar } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";

import {AdminContext} from '../../context/AdminContext';
import adminStyles from "./AdminStyles";
const LeftContent = (props) => <Avatar.Icon {...props} icon="folder" />;

const TeacherList = () => {
  const { adminState, getTeachers } = React.useContext(AdminContext);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filtered, setFiltered] = React.useState(adminState.classes);
  const onChangeSearch = query => {
      setSearchQuery(query);
    };

  React.useEffect(() => {
    getTeachers();
  }, [])

  React.useEffect(() => {
    // console.log(searchQuery);
    // console.log(filtered);
    if(searchQuery === ''){
        setFiltered(adminState.teachers);
    } else {
        setFiltered(adminState.teachers.filter((teacher) => {
            if(teacher.name.includes(searchQuery)){
                return(teacher);
            }
        }));
    }
  }, [searchQuery]);

  return (
    <View>
        <Searchbar
            placeholder="Search teacher.."
            onChangeText={onChangeSearch}
            value={searchQuery}

        />
        <ScrollView>
        { filtered.map(teacher => (
            <View key={teacher._id}>
                <Card style={adminStyles.card}>
                    <Card.Title
                        title={teacher.name}
                        subtitle={teacher.email}
                        left={LeftContent}
                    />
                    <Card.Content></Card.Content>
                </Card>
            </View>
        )) }
        </ScrollView>
    </View>
  );
};

export default TeacherList;
