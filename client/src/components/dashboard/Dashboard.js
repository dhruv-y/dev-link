import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profile';
import { Link } from 'react-router-dom';
import DashboardActions from './DashboardActions';
import Education from './Education';
import Experience from './Experience';

const Dashboard = ({ getCurrentProfile, auth: { user }, profile: { profile, loading } }) => {
    useEffect(() => {
        getCurrentProfile()
    }, [])

    return (
        <Fragment>
            {loading ? (
                <h3>Loading...</h3>
            ) : (
                    <Fragment>
                        <h1 className="large text-primary">Dashboard</h1>
                        <p className='lead'>
                            <i className='fas fa-user'></i>Welcome {user && user.name}
                        </p>
                        {
                            profile !== null ? (
                                <Fragment>
                                    <DashboardActions />
                                    <Education education={profile.education} />
                                    <Experience experience={profile.experience} />
                                </Fragment>
                            ) : (
                                    <Fragment>
                                        <p>You have not setup a profile yet! Pls add some info</p>
                                        <Link to='/create-profile' className='btn btn-primary my-1' >
                                            Create Profile
                            </Link>
                                    </Fragment>
                                )}

                    </Fragment>
                )}
        </Fragment>
    )
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile
})

export default connect(mapStateToProps, { getCurrentProfile })(Dashboard);