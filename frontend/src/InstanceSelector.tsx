//Create a react component, that will have one dropdown which will show values received from an Api Call using axios to this URL https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances. This url returns a string array which needs to be bound to the dropdown.
import React from 'react';
import { Input } from 'reactstrap';

export default class InstanceSelector extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            items: []
        };
    }

    //Api Call using axios to this URL https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances. This url returns a string array which needs to be bound to the dropdown
    componentDidMount() {
        fetch('https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.setState({ items: data });
            });
    }

    render() {
        return (
            <div>
                <Input
                    type="select">
                    {this.state.items.map((item: any) => <option key={item}>{item}</option>)}
                </Input>
                <Input type="date" />
                <Input type="time" />
            </div >
        );
    }
}
