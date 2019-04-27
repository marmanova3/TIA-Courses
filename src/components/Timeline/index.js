import withAuthorization from "../Session/withAuthorization";
import {Component} from "react";
import React from "react";
import EventsList, {BlockMenu} from "../Events"
import { Container, Row, Col } from 'reactstrap';

import {NavigationCourse} from "../Navigation";

class Timeline extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            events: [],
            courseInstance: undefined,
            course: undefined,
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        const { match: { params } } = this.props;

        this.props.firebase.courseInstance(params.id)
            .get()
            .then(snapshot => {
                const courseInstance = { ...snapshot.data(), cid: snapshot.id };

                if(courseInstance) {
                    this.setState({
                        courseInstance: courseInstance,
                    });

                    this.props.firebase.course(this.state.courseInstance.instanceOf)
                        .get()
                        .then(snapshot => {
                            const course = snapshot.data();

                            this.setState({
                                course: course,
                            });
                        });

                    this.props.firebase
                        .courseEvents()
                        .where("course", "==", params.id)
                        .get()
                        .then(async  snapshot => {
                            let events = [];

                            snapshot.forEach(doc =>
                                    events.push({...doc.data(), timestamp: doc.data().dateTime, eid: doc.id}),
                            );

                            this.setState({
                                loading: false,
                                events: events,
                            });


                            // let bool = await isEnrolledIn(this.props.authUser.uid, this.state.courseInstance.cid, this.props.firebase);
                        });
                }
            });
    }

    render() {
        return (
            <div>
                <NavigationCourse authUser={this.props.authUser} course={this.state.courseInstance} />
                <main>
                    <Container>
                        <Row>
                            <Col xs="1">
                                <h2>Timeline</h2>
                                <BlockMenu courseEvents={this.state.events}/>
                            </Col>
                            <Col>
                                {this.state.course &&
                                <h1>{this.state.course.name}</h1>}
                                <EventsList courseEvents={this.state.events} type={"Lecture"}/>
                            </Col>
                        </Row>
                    </Container>
                </main>
            </div>
        );
    }
}

const condition = authUser => !!authUser;

// const condition = async ({authUser, course}) => authUser && await isEnrolledIn(authUser.uid, course.cid);
// const condition = async (authUser, course, firebase) => authUser && await isEnrolledIn(authUser.uid, course.cid, firebase);

export default withAuthorization(condition)(Timeline);