import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import * as V from 'victory';
import { VictoryBar, VictoryScatter, VictoryChart, VictoryTheme, VictoryPie, VictoryLabel, VictoryLegend } from 'victory';
import { Card, CardBody, HeadingText, NrqlQuery, Spinner, AutoSizer } from 'nr1';

export default class Nr1AnimationViz1Visualization extends React.Component {
    // Custom props you wish to be configurable in the UI must also be defined in
    // the nr1.json file for the visualization. See docs for more details.
    static propTypes = {
        intervalms: PropTypes.number,
        /**
         * An array of objects consisting of a nrql `query` and `accountId`.
         * This should be a standard prop for any NRQL based visualizations.
         */
        nrqlQueries: PropTypes.arrayOf(
            PropTypes.shape({
                accountId: PropTypes.number,
                query: PropTypes.string,
                title: PropTypes.string,
            })
        ),
    };

    /** Constructor,  use this to init your state variables */
    constructor(props) {
        super(props);
        this.state = {
            activequeryindex: 0,
        };
    }


    /** Method called when the react component mounts (is loaded)  */
    componentDidMount() {

        const { nrqlQueries, intervalms } = this.props;
        let intval = 6000;
        if (intervalms != undefined) {
            intval = intervalms
        }
        this.setStateInterval = window.setInterval(() => {   // create a timer 

            const { nrqlQueries, intervalms } = this.props;
            // use a temp variable to determine next value of index:
            if (nrqlQueries.length > 1) {
                var temp = this.state.activequeryindex;
                temp++;
                if (temp > nrqlQueries.length - 1)
                    temp = 0;

                  if(nrqlQueries[temp].query == undefined || nrqlQueries[temp].accountId == undefined)
                    temp = 0;  // 


                this.setState({
                   // pieData: this.getRandomData(),
                    activequeryindex: temp,
                });
            }
        }, intval);   // every X ms
    }

    //** called when comp is removed,   */
    componentWillUnmount() {
        window.clearInterval(this.setStateInterval);
    }


    /** TEST Functions */
    random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    range(range) {
        return Array(range).fill().map((x, i) => i);;
    }


    getRandomData() {
        var obj = [];
        obj.push({ x: "Cats", y: this.random(10, 50) });
        obj.push({ x: "Dogs", y: this.random(10, 50) });
        obj.push({ x: "Birds", y: this.random(10, 50) });
        return obj;

    }
    //*** end test functions  */

    /** Data transformer,  used to change data from nrql return from to the format the graphic wants  */
    transformDataPie = (rawData) => {
        return rawData.map((entry) => ({
            x: entry.metadata.name,
            // Only grabbing the first data value because this is not time-series data.
            y: entry.data[0].count,
        }));
    };


    render() {
        const { nrqlQueries } = this.props;

        const nrqlQueryPropsAvailable =
            nrqlQueries &&
            nrqlQueries[0] &&
            nrqlQueries[0].accountId &&
            nrqlQueries[0].query;

        if (!nrqlQueryPropsAvailable) {
            return <EmptyState />;
        }

        // get the title for the active chart
        const charttitle = nrqlQueries[this.state.activequeryindex].title;

        const fillcolor = "#FFBb00";

        return (
            <AutoSizer>
                {({ width, height }) => (
                    <NrqlQuery
                        query={nrqlQueries[this.state.activequeryindex].query}
                        accountId={parseInt(nrqlQueries[this.state.activequeryindex].accountId)}
                        pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
                    >
                        {({ data, loading, error }) => {
                            if (loading) {
                                return <Spinner />;
                            }

                            if (error) {
                                return <ErrorState />;
                            }


                            const testme = this.transformDataPie(data);
                            //  <VictoryPie colorScale={["tomato", "orange", "gold", "cyan", "navy"]} data={testme}  />
                            if (this.state.activequeryindex == 0) {
                                return (
                                    <div style={{ textAlign: "center", paddingTop: "30px" }}>
                                        <h1>{charttitle}</h1>
                                        <VictoryChart animate={{ duration: 4000 }}  >
                                            <VictoryBar style={{ data: { fill: fillcolor } }} data={testme} />
                                        </VictoryChart>
                                    </div>
                                );
                            }
                            else {
                                return (
                                    <div style={{ textAlign: "center", paddingTop: "30px" }}>
                                        <h1>{charttitle}</h1>
                                        <VictoryChart animate={{ duration: 4000 }} >
                                            <VictoryBar style={{ data: { fill: fillcolor } }} data={testme} />
                                        </VictoryChart>
                                    </div>
                                );
                            }
                        }}
                    </NrqlQuery>
                )}
            </AutoSizer>
        );
    }
}

const EmptyState = () => (
    <Card className="EmptyState">
        <CardBody className="EmptyState-cardBody">
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Please provide at least one NRQL query & account ID pair
            </HeadingText>
            <HeadingText
                spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
                type={HeadingText.TYPE.HEADING_4}
            >
                An example NRQL query you can try is:
            </HeadingText>
            <code>
                FROM Transaction SELECT count(*) FACET appName Limit 5
            </code>
        </CardBody>
    </Card>
);

const ErrorState = () => (
    <Card className="ErrorState">
        <CardBody className="ErrorState-cardBody">
            <HeadingText
                className="ErrorState-headingText"
                spacingType={[HeadingText.SPACING_TYPE.LARGE]}
                type={HeadingText.TYPE.HEADING_3}
            >
                Oops! Something went wrong.
            </HeadingText>
        </CardBody>
    </Card>
);
