import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="content-wrapper pb-2 mb-0">
        {/* Header Section */}
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0 text-dark">Dashboard</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">Home</li>
                  <li className="breadcrumb-item active">Dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <section className="content">
          <div className="container-fluid">
            {/* Info Boxes */}
            <div className="row">
              <div className="col-12 col-sm-6 col-md-3 mb-4">
                <div className="info-box shadow-sm">
                  <span className="info-box-icon bg-info">
                    <i className="fas fa-truck text-white" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Vehicles</span>
                    <span className="info-box-number">33</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3 mb-4">
                <div className="info-box shadow-sm">
                  <span className="info-box-icon bg-success">
                    <i className="fa fa-user-secret text-white" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Drivers</span>
                    <span className="info-box-number">6</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3 mb-4">
                <div className="info-box shadow-sm">
                  <span className="info-box-icon bg-warning">
                    <i className="fa fa-user text-white" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Total Customers</span>
                    <span className="info-box-number">498</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3 mb-4">
                <div className="info-box shadow-sm">
                  <span className="info-box-icon bg-danger">
                    <i className="fas fa-id-card text-white" />
                  </span>
                  <div className="info-box-content">
                    <span className="info-box-text">Today's Trips</span>
                    <span className="info-box-number">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Reminders */}
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title">Income and Expenses</h3>
                  </div>
                  <div className="card-body">
                    <div className="position-relative mb-4">
                      <img
                        className="img-fluid"
                        src="https://i.ibb.co/mRCYq2g/png-transparent-line-chart-bar-chart-graph-miscellaneous-infographic-angle-thumbnail-removebg-previe.png"
                        alt="Income and Expenses Chart"
                      />
                    </div>
                    <div className="d-flex flex-row justify-content-end">
                      <span className="mr-2">
                        <i className="fas fa-square text-success" /> Income
                      </span>
                      <span>
                        <i className="fas fa-square text-danger" /> Expenses
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="ion ion-clipboard mr-1" />
                      Reminders
                    </h3>
                  </div>
                  <div className="card-body">
                    <ul className="todo-list">
                      <li>No reminders</li>
                    </ul>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-info float-right">
                      <i className="fas fa-plus" /> Add Reminder
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Section */}
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title">Vehicle Current Location</h3>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Current Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['prueba', 'rxking', 'Teste', 'tesa'].map((name, index) => (
                            <tr key={index}>
                              <td>{name}</td>
                              <td>
                                <span className="badge badge-warning">
                                  Location Not Updated
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title">Vehicle Running Status</h3>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['SK BIKE', 'Audi', 'marchu', 'Nissan'].map((name, index) => (
                            <tr key={index}>
                              <td>{name}</td>
                              <td>
                                <span className="badge badge-danger">In Trip</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;