import React from 'react';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';

import md5 from 'md5';
import { Text, Toast } from 'native-base';
import { StackActions, NavigationActions } from 'react-navigation';

import { Form } from './Form';

import Loader from '../../components/Loader';

import firebase from '../../services/firebase';
import { storeData } from '../../services/storage';

export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: false };
    }

    static navigationOptions = {
        header: null
    }

    saveRegister = (values) => {
        this.setState({ loading: true });
        const { name, email, password } = values;
        firebase.database().ref('users').once('value')
            .then(async snapshot => {
                snapshot.forEach(data => {
                    if (data.val().email === email) {
                        throw new Error('email-already-in-use');
                    }
                });
                await firebase.database().ref('users').push({
                    name,
                    email,
                    avatar_url: `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}?d=identicon`,
                });
                const data = await firebase.auth().createUserWithEmailAndPassword(email, password);
                await storeData('user', { email: data.user.email });
                this.setState({ loading: false });
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'Dashboard' })],
                });
                this.props.navigation.dispatch(resetAction);
            })
            .catch(err => {
                this.setState({ loading: false });
                if (err.message === 'email-already-in-use') {
                    Toast.show({
                        text: 'Email indisponível, tente outro.',
                        type: 'warning',
                        position: 'top'
                    });
                } else {
                    Toast.show({
                        text: 'Por favor, tente novamente mais tarde.',
                        type: 'danger',
                        position: 'top'
                    });
                }
            });
    }

    render() {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <Loader loading={this.state.loading} />
                <View style={styles.login}>
                    <Text style={styles.text}>Cadastrar-se</Text>
                    <View style={styles.separator}></View>
                    <Form submit={this.saveRegister} />
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    login: {
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 30,
        height: 455,
        width: 350,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
    },
    text: {
        fontSize: 24,
        letterSpacing: 1.5,
        marginTop: 30,
    },
    separator: {
        backgroundColor: '#000',
        width: 120,
        height: 2,
        marginBottom: 30,
    },
    item: {
        marginBottom: 10,
        width: 300,
        height: 42
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        width: 300,
        height: 42,
        marginBottom: 10,
        backgroundColor: '#4e73df'
    }
});
