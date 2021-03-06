import React, {useState, useEffect, useContext} from 'react';
import {useStaticQuery, graphql, Link} from 'gatsby';
import {GridContainer, Div, Grid} from '../Sections'
import {H2, H3, H4, H5, Paragraph} from '../Heading'
import {Colors, Button, Img, Anchor} from '../Styling'
import dayjs from "dayjs"
import Select from '../Select'
import 'dayjs/locale/de'
import Icon from '../Icon';
import LazyLoad from 'react-lazyload';
import {SessionContext} from '../../session'

const info = {
    us: {
        "full-stack": "/us/coding-bootcamp/part-time-full-stack-developer",
        "software-engineering": "/us/coding-bootcamp/software-engineer-bootcamp",
        "machine-learning-pt-16w": "/us/coding-bootcamp/machine-learning-engineering",
        "full-stack-ft": "/us/coding-bootcamp/full-time-full-stack-developer"
    },
    es: {
        "full-stack": "/es/coding-bootcamp/full-stack-part-time",
        "software-engineering": "/es/coding-bootcamp/ingenieria-de-software-programacion",
        "machine-learning-pt-16w": "/es/coding-bootcamp/curso-inteligencia-artificial",
        "full-stack-ft": "/es/coding-bootcamp/full-stack-full-time"
    }
}
const locations = {
    us: {
        "santiago-chile": "/us/coding-campus/coding-bootcamp-santiago",
        "downtown-miami": "/us/coding-campus/coding-bootcamp-miami",
        "madrid-spain": "/us/coding-campus/coding-bootcamp-madrid",
        "online": "/us/coding-campus/online-coding-bootcamp",
        "caracas-venezuela": "/us/coding-campus/coding-bootcamp-caracas",
        "costa-rica": "/us/coding-campus/coding-bootcamp-costa-rica"
    },
    es: {
        "downtown-miami": "/es/coding-campus/bootcamp-programacion-miami",
        "santiago-chile": "/es/coding-campus/bootcamp-programacion-santiago",
        "madrid-spain": "/es/coding-campus/bootcamp-programacion-madrid",
        "online": "/es/coding-campus/online-bootcamp-programacion",
        "caracas-venezuela": "/es/coding-campus/bootcamp-programacion-caracas",
        "costa-rica": "/es/coding-campus/bootcamp-programacion-costa-rica"
    }
}
const locationText = {
    us: "or",
    es: "o"
}
const UpcomingDates = ({lang, location, message}) => {
    const dataQuery = useStaticQuery(graphql`
    {
      allUpcomingDatesYaml {
        edges {
          node {
            title
            paragraph
            button {
              text
              top_label
            }
            info {
              button_link
              button_text
              program_label
              duration_label
              duration_weeks
              location_label
            }
            no_course_message
            footer {
              button_text
              button_text_close
              button_text_open
              button_link
            }
            fields {
                lang
              }
          }
        }
      }
    }
  `)

    const {session} = useContext(SessionContext);

    const [data, setData] = useState({
        cohorts: {catalog: [], all: [], filtered: []}
    });
    const [academy, setAcademy] = useState(null)
    const [filterType, setFilterType] = useState({label: "Upcoming Courses and Events", value: "cohorts"});
    let content = dataQuery.allUpcomingDatesYaml.edges.find(({node}) => node.fields.lang === lang);
    if (content) content = content.node;
    else return null;
    useEffect(() => {
        const getData = async () => {
            var resp = null;
            if (location) {
                // resp = await fetch(`https://breathecode.herokuapp.com/v1/admissions/cohort/all?upcoming=true&academy=${location}`)
                resp = await fetch(`${process.env.GATSBY_BREATHECODE_HOST}/admissions/cohort/all?upcoming=true&academy=${location}`)
            }
            else {
                resp = await fetch(`${process.env.GATSBY_BREATHECODE_HOST}/admissions/cohort/all?upcoming=true`);
            }
            // let resp = await fetch(`${process.env.GATSBY_BREATHECODE_HOST}/admissions/cohort/all?upcoming=true`);
            let cohorts = await resp.json();
            setData(oldData => ({
                cohorts: {catalog: oldData.cohorts.catalog, all: cohorts, filtered: cohorts}
            }))
        }
        getData();
    }, []);

    useEffect(() => {
        if (session && Array.isArray(session.locations)) {
            const _data = {
                ...data,
                cohorts: {
                    ...data.cohorts,
                    catalog: [{label: 'All Locations', value: null}].concat(
                        session.locations.map(l => ({label: l.city, value: l.breathecode_location_slug}))
                    )
                }
            }
            setData(_data);
        }
    }, [session]);
    return (
        <GridContainer padding_tablet="0" margin_tablet="0 0 48px 0">
            <Div flexDirection="column">
                <Div padding="0 0 30px 0" style={{borderBottom: "1px solid black"}} justifyContent_md="between" flexDirection="column" flexDirection_tablet="row" alignItems_tablet="center">
                    <H3 textAlign="left" width="188px">Next Dates</H3>
                    {!location &&
                        <Select
                            // margin="0 10px 0 0"
                            top="40px"
                            left="20px"
                            width="300px"
                            maxWidth="100%"
                            shadow="0px 0px 6px 2px rgba(0, 0, 0, 0.2)"
                            options={console.log("catalog", data.cohorts.catalog) || data.cohorts.catalog}
                            openLabel={lang == "us" ? academy ? "Campus: " + academy.label : "Select one academy" : academy ? "Campus: " + academy.label : "Escoge una academia"}
                            closeLabel={lang == "us" ? academy ? "Campus: " + academy.label : "Select one academy" : academy ? "Campus: " + academy.label : "Escoge una academia"}
                            onSelect={(opt) => {
                                setAcademy(opt)
                                setData({
                                    ...data,
                                    [filterType.value]: {
                                        ...data[filterType.value],
                                        filtered: opt.label !== 'All Locations' ? data[filterType.value].all.filter(elm => elm.academy.slug === opt.value) : data[filterType.value].all
                                    }
                                });
                            }}
                        />}
                </Div>
                {Array.isArray(data.cohorts.filtered) && data.cohorts.filtered.length > 0 ? data.cohorts.filtered.map((m, i) => {
                    return (
                        i < 4 &&
                        <Div key={i} flexDirection="column" flexDirection_tablet="row" style={{borderBottom: "1px solid black"}} padding="30px 0" justifyContent="between" >
                            <Div flexDirection_tablet="column" width_tablet="15%" alignItems="center" alignItems_tablet="start" margin="0 0 10px 0">
                                <H4 textAlign="left" textTransform="uppercase" width="fit-content" margin="0 10px 0 0" fontWeight="700" lineHeight="22px">{dayjs(m.kickoff_date).format("MMM")}</H4>
                                <Paragraph textAlign="left" fontWeight="700">{`
                                ${lang === "us" ? dayjs(m.kickoff_date).add(5, "hour").locale("en").format("MM/DD") : dayjs(m.kickoff_date).add(5, "hour").locale("es").format("dd/MM")} 
                                - 
                                ${lang === "us" ? dayjs(m.ending_date).add(5, "hour").locale("en").format("MM/DD") : dayjs(m.ending_date).add(5, "hour").locale("es").format("dd/MM")}
                                `}
                                </Paragraph>
                            </Div>
                            <Div flexDirection="column" width_tablet="35%" margin="0 0 20px 0">
                                <H4 textAlign="left" textTransform="uppercase">{content.info.program_label}</H4>
                                <Link to={info[lang][m.syllabus.certificate.slug] || ""}><Paragraph textAlign="left" color={Colors.blue}>{m.syllabus.certificate.name}</Paragraph></Link>
                            </Div>
                            <Div flexDirection="column" display="none" display_tablet="flex" >
                                <H4 textAlign="left" textTransform="uppercase">{content.info.location_label}</H4>
                                <Div>
                                    <Link to={locations[lang][m.academy.slug] || ""}>
                                        <Paragraph textAlign="left" color={Colors.blue}>{m.academy.city.name}</Paragraph>
                                    </Link>
                                    {m.academy.slug != "online" && <Link to={locations[lang]['online'] || ""}>
                                        <Paragraph textAlign="left" margin="0 0 0 3px" color={Colors.blue}>{`${locationText[lang]} Online`}</Paragraph>
                                    </Link>}
                                </Div>
                            </Div>
                            <Div flexDirection="column" display="none" display_tablet="flex">
                                <H4 textAlign="left" textTransform="uppercase">{content.info.duration_label}</H4>
                                <Paragraph textAlign="left">{content.info.duration_weeks}</Paragraph>
                            </Div>
                            <Div display="flex" display_tablet="none" justifyContent="between" margin="0 0 20px 0">
                                <Div flexDirection="column" width="50%">
                                    <H4 textAlign="left" textTransform="uppercase">{content.info.location_label}</H4>
                                    <Div>
                                        <Link to={locations[lang][m.academy.slug] || ""}>
                                            <Paragraph textAlign="left" color={Colors.blue}>{m.academy.city.name}</Paragraph>
                                        </Link>
                                        {m.academy.slug != "online" && <Link to={locations[lang]['online'] || ""}>
                                            <Paragraph textAlign="left" margin="0 0 0 3px" color={Colors.blue}>{`${locationText[lang]} Online`}</Paragraph>
                                        </Link>}
                                    </Div>
                                </Div>
                                <Div flexDirection="column" width="50%">
                                    <H4 textAlign="left" textTransform="uppercase">{content.info.duration_label}</H4>
                                    <Paragraph textAlign="left">{content.info.duration_weeks}</Paragraph>
                                </Div>
                            </Div>
                            <Div flexDirection="column">
                                <Link to={content.info.button_link}>
                                    <Button variant="full" width="fit-content" color={Colors.black} margin="10px 0" textColor="white">{content.info.button_text}</Button>
                                </Link>
                            </Div>
                        </Div>
                    )
                })
                    :
                    <Div flexDirection="column" justifyContent="center" alignItems="center" padding_tablet="90px 0">
                        <Icon icon="agenda" />
                        {message && <Paragraph margin="25px 0 0 0">{message}</Paragraph>}
                    </Div>
                }
                {Array.isArray(data.cohorts.filtered) && data.cohorts.filtered.length > 0 && <Link to={content.footer.button_link}><Paragraph margin="20px 0" color={Colors.blue}>{content.footer.button_text}</Paragraph></Link>}
            </Div>
        </GridContainer >
    )
};

export default UpcomingDates;