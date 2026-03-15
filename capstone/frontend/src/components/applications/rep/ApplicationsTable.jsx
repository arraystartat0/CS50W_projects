import React from "react";
import DataTable from "react-data-table-component";

const statusClassMap = {
  Active: "bg-active",
  Completed: "bg-active",
  Unopened: "bg-unopened",
  "Interview Scheduled": "bg-interview-scheduled",
  Denied: "bg-rejected",
  Pending: "bg-unopened",
  "Under Review": "bg-under-review",
};

const ApplicationsTable = ({ applications, onReview, onDelete }) => {

const columns = [
    {
      name: "Full Name",
      selector: row => row.full_name,
      sortable: true,
      wrap: true,
      minWidth: '150px',
      center: true,
      cell: row => <span className="fs-6">{row.full_name}</span>,
    },
    {
      name: "Listing",
      selector: row => row.posting?.title,
      sortable: true,
      wrap: true,
      minWidth: '120px',
      center: true,
      cell: row => (
        <span className="fs-6">
          <a className="text-black" href={`/listing/${row.posting?.UID}`}>
            {row.posting?.title || 'N/A'}
          </a>
        </span>
      ),
    },
    {
      name: "Date Applied",
      selector: row => row.applied_at,
      sortable: true,
      wrap: true,
      minWidth: '120px',
      center: true,
      cell: row => {
        // Format the date nicely
        const date = new Date(row.applied_at);
        return <span className="fs-6">{date.toLocaleDateString()}</span>;
      },
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      wrap: true,
      minWidth: '140px',
      center: true,
      cell: row => (
        <span className={`badge unround ${statusClassMap[row.status] || 'bg-light-gray'}`}> 
          {row.status}
        </span>
      ),
    },
    {
      name: "Operations",
      center: true,
      cell: row => (
        <div className="d-flex justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-transparent unround border border-1 border-black hover-green"
            onClick={() => onReview(row)}
          >
            Review
          </button>
          <button
            className="btn btn-sm btn-danger unround border border-1 border-black"
            onClick={() => onDelete(row)}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      minWidth: '140px',
    },
  ];

  const customStyles = {
    tableWrapper: {
      style: {
        display: 'block',
        overflowX: 'auto',
        border: '1px solid #000',
        borderRadius: '0.25rem',
      },
    },
    table: {
      style: {
        borderBottom: 'none',
      },
    },
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        whiteSpace: "normal",
        wordWrap: "break-word",
        textAlign: 'center',
        borderBottom: "1px solid #000",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordWrap: "break-word",
        paddingTop: "0.6rem",
        paddingBottom: "0.6rem",
        textAlign: 'center',
        borderBottom: "1px solid #000",
      },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={applications}
      pagination
      defaultSortField="applied_at" 
      defaultSortAsc={false}
      fixedHeader
      fixedHeaderScrollHeight="500px"
      responsive
      customStyles={customStyles}
    />
  );
};

export default ApplicationsTable;