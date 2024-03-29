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
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { Linking } from 'react-native';

import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

import { View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { URL } from '../../config';
import adminStyles from '../admin/AdminStyles';
import { AuthContext } from '../../context/AuthContext';
const LeftContent = (props) => <Avatar.Icon {...props} icon="folder" />;

const StudentFileView = ({ navigation, route }) => {
  const url = URL;
  const [files, setFiles] = React.useState(null);
  const [filtered, setFiltered] = React.useState();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [flag, setFlag] = React.useState(false);
  const { authState } = React.useContext(AuthContext);
  const { user } = authState;

  const [token, setToken] = React.useState('');

  const { class_ } = user;

  const date = new Date();
  const todayDate = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const displayDate = `${todayDate}-${month}-${year}`;

  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };

  const getFiles = async () => {
    try {
      console.log(url + '/documents/class/' + class_);
      let res = await axios.get(url + '/documents/class/' + class_);
      const files_ = res.data.files;
      setFiles(files_);
      setSearchQuery(' ');
      setSearchQuery('');
      console.log(date);
    } catch (err) {
      console.log(err);
    }
  };

  const saveFile = async (fileUri) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
    }
  };

  const downloadFile = (filename, caption) => {
    const uri = URL + `/documents/file/${filename}`;
    let fileUri = FileSystem.documentDirectory + caption + '.pdf';
    FileSystem.downloadAsync(uri, fileUri)
      .then(({ uri }) => {
        saveFile(uri);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  React.useEffect(() => {
    getFiles();
  }, [flag]);

  React.useEffect(() => {
    if (searchQuery === '') {
      setFiltered(files);
    } else {
      setFiltered(
        files.filter((file) => {
          if (file.caption.toLowerCase().includes(searchQuery.toLowerCase())) {
            return file;
          }
        })
      );
    }
  }, [searchQuery]);

  return (
    <React.Fragment>
      <Searchbar
        placeholder="Search Files.."
        onChangeText={onChangeSearch}
        value={searchQuery}
      />
      <ScrollView>
        <View style={styles.viewStyle}>
          {filtered ? (
            filtered.map((file) => (
              <View key={file._id}>
                <Card style={{ marginTop: 10, backgroundColor: '#eee' }}>
                  <TouchableRipple onPress={() => {}}>
                    <React.Fragment>
                      <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <View>
                          <Card.Content>
                            <Title>{file.caption}</Title>

                            <Paragraph>Teacher :{file.teacherName} </Paragraph>
                            <View>
                              <Paragraph>
                                Date: {file.createdAt.slice(0, 10)}
                              </Paragraph>
                              <Paragraph
                                style={{
                                  marginBottom: 10,
                                }}
                              >
                                Size: {parseInt(file.length) / 1000} kb
                              </Paragraph>
                            </View>
                          </Card.Content>
                        </View>
                        <View
                          style={{ marginLeft: 'auto', alignSelf: 'center' }}
                        >
                          <IconButton
                            icon="download"
                            size={35}
                            onPress={() => {
                              alert('File Downloaded !');
                              downloadFile(file.filename, file.caption);
                            }}
                            color="#2D5264"
                          />
                        </View>
                        <View
                          style={{ marginLeft: 'auto', alignSelf: 'center' }}
                        >
                          <IconButton
                            icon="send"
                            size={35}
                            onPress={() => {
                              Linking.openURL(
                                `mailto:${file.teacherEmail}?subject=${file.caption}&body=Attach your submission here.`
                              );
                            }}
                            color="#2D5264"
                          />
                        </View>
                      </View>
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

export default StudentFileView;
