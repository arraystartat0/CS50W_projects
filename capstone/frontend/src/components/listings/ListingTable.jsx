import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

const ExpandedComponent = ({ data }) => {
  const renderField = (value) => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : "N/A";
  };
  return (
    <div
      className="expanded-content p-4"
      style={{
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        borderLeft: "5px solid #5b6e66",
        color: "#343a40",
        fontSize: "0.95rem",
      }}
    >
      <div className="row">
        <div className="col-md-6">
          <h5 className="mb-3 text-hireFlow-green-dark">Posting Details</h5>
          <p>
            <strong>Title:</strong> {renderField(data.title)}
          </p>
          <p>
            <strong>Job Type:</strong> {renderField(data.job_type)}
          </p>
          <p>
            <strong>Location:</strong> {renderField(data.location)}
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {data.start_date
              ? new Date(data.start_date).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>End Date:</strong>{" "}
            {data.end_date
              ? new Date(data.end_date).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`badge unround ${
                data.status === "Active" ? "bg-active" : "bg-inactive"
              }`}
            >
              {renderField(data.status)}
            </span>
          </p>
          <p>
            <strong>Description:</strong> <br /> {renderField(data.description)}
          </p>
          <p>
            <strong>Additional Info:</strong> <br />{" "}
            {renderField(data.additional_info)}
          </p>
          <p>
            <strong>Documents Needed:</strong> <br />
            {Array.isArray(data.documents_needed) &&
            data.documents_needed.length > 0
              ? data.documents_needed.join(", ")
              : "N/A"}
          </p>
        </div>
        <div className="col-md-6">
          <h5 className="mb-3 text-hireFlow-green-dark">Payment Information</h5>
          {data.is_paid ? (
            <p>
              <strong>Payment Details:</strong> <br />
              {data.pay_rate && data.currency && data.wage_type
                ? `${data.currency} ${data.pay_rate} ${data.wage_type
                    .toLowerCase()
                    .replace("_", " ")}`
                : "N/A"}
            </p>
          ) : (
            <p className="text-danger fw-bold">Unpaid Posting</p>
          )}

          <h5 className="mb-3 mt-4 text-hireFlow-green-dark">
            Application Overview
          </h5>
          <p>
            <strong>Total Applications:</strong>{" "}
            <span className="fw-bold text-dark">
              {renderField(data.applications)}
            </span>
          </p>
          <p>
            <strong>Interviews Scheduled:</strong>{" "}
            <span className="fw-bold text-dark">
              {renderField(data.interviews)}
            </span>
          </p>
          <p>
            <strong>Rejections:</strong>{" "}
            <span className="fw-bold text-dark">
              {renderField(data.rejections)}
            </span>
          </p>

          <h5 className="mb-3 mt-4 text-hireFlow-green-dark">Metadata</h5>
          <p>
            <strong>Posting ID (UID):</strong> {renderField(data.UID)}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {data.created_at
              ? new Date(data.created_at).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Company:</strong>{" "}
            {renderField(data.company ? data.company.name : null)}
          </p>
          <p>
            <strong>Representative:</strong>{" "}
            {renderField(
              data.representative ? data.representative.full_name : null
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const ListingTable = ({ listings, onEditListing, onDeleteListing }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();

  const handleApplicationsClick = (listing) => {
    // redirect to applications page with listing title as URL param
    navigate(`/rep/applications?listing=${encodeURIComponent(listing.title)}`);
  };

  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      cell: (row) => <span className={`fs-6`}>{row.title}</span>,
    },
    {
      name: "Applications",
      selector: (row) => row.applications,
      sortable: true,
      cell: (row) => (
        <span className={`fs-6`}>
          <button
            className="btn btn-link text-black p-0 text-decoration-underline"
            onClick={() => handleApplicationsClick(row)}
            style={{ border: 'none', background: 'none' }}
          >
            {row.applications}
          </button>
        </span>
      ),
    },
    {
      name: "Interviews",
      selector: (row) => row.interviews,
      sortable: true,
      cell: (row) => <span className={`fs-6`}>{row.interviews}</span>,
    },
    {
      name: "Rejections",
      selector: (row) => row.rejections,
      sortable: true,
      cell: (row) => <span className={`fs-6`}>{row.rejections}</span>,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`badge unround ${
            row.status === "Active" ? "bg-active" : "bg-inactive"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Operations",
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-secondary unround border border-1 border-black"
            onClick={() => onEditListing(row)}
          >
            <i className="fa-solid fa-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger unround border border-1 border-black"
            onClick={() => onDeleteListing(row)}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => expandedRows.includes(row.id),
      classNames: ["expanded-row"],
      style: {
        borderBottom: "none",
      },
    },
  ];

  const onRowExpandToggled = (expanded, row) => {
    if (expanded) {
      setExpandedRows((prev) => [...prev, row.id]);
    } else {
      setExpandedRows((prev) => prev.filter((id) => id !== row.id));
    }
  };

  const customStyles = {
    table: {
      style: {
        border: "1px solid #000",
        borderBottom: "none",
        borderRadius: "0.25rem",
      },
    },
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        whiteSpace: "normal",
        wordWrap: "break-word",
        justifyContent: "center",
        alignItems: "center",
        borderBottom: "1px solid #000",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordWrap: "break-word",
        paddingTop: "0.6rem",
        paddingBottom: "0.6rem",
        justifyContent: "center",
        alignItems: "center",
        borderBottom: "1px solid #000",
      },
    },
  };

  return (
    <div className="table-responsive">
      <DataTable
        columns={columns}
        data={listings}
        pagination
        defaultSortField="id"
        defaultSortAsc={false}
        fixedHeader
        fixedHeaderScrollHeight="80vh"
        highlightOnHover
        expandableRows
        expandableRowsComponent={ExpandedComponent}
        onRowExpandToggled={onRowExpandToggled}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
      />
    </div>
  );
};

export default ListingTable;
