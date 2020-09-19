import * as React from 'react';
import axios from 'axios';
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  TouchableRipple,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import adminStyles from '../admin/AdminStyles';
const LeftContent = (props) => <Avatar.Icon {...props} icon="folder" />;

const Files = ({ navigation, route }) => {
  const url = 'https://school-server-testing.herokuapp.com';
  const [files, setFiles] = React.useState(null);

  const { class_ } = route.params;

  const getFiles = async () => {
    try {
      console.log(url + '/documents/class/'+  class_);

      let res = await axios.get(url + '/documents/class/' + class_);
      const files_ = res.data.files;
      setFiles(files_);
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    getFiles();
    console.log(files);
  }, []);

  return (
    <React.Fragment>
    <ScrollView>
      <View style={styles.viewStyle}>
        {files ? (
          files.map((file) => (
            <View key={file._id}>
              <Card style={{ marginTop: 10, backgroundColor: '#eee' }}>
                <TouchableRipple onPress={() => {}}>
                  <React.Fragment>
                    <Card.Content>
                      <Title>{file.caption}</Title>
                      <Paragraph>{file.filename}</Paragraph>
                      <Paragraph>Subject:</Paragraph>
                      <View style={{ flexDirection: 'row' }}>
                        <Paragraph>Date:</Paragraph>
                        <Paragraph
                          style={{ marginLeft: 160, marginBottom: 10 }}
                        >
                          Size:
                        </Paragraph>
                      </View>
                    </Card.Content>
                  </React.Fragment>
                </TouchableRipple>
              </Card>
            </View>
          ))
        ) : (
          <View style={styles.container}>
            <ActivityIndicator
              animating={true}
              size="large"
              style={styles.loading}
            />
          </View>
        )}
      </View>
    </ScrollView>
    <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Add')}
    />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  loading: {
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default Files;