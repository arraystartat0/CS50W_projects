import React, { useState } from "react";
import DataTable from "react-data-table-component";
import ConfirmDeleteModal from "../../modals/ConfirmDeleteModal";

const statusClassMap = {
  Active: "bg-active",
  Completed: "bg-active",
  "Decision pending": "bg-decision-pending",
  Unopened: "bg-unopened",
  "Interview Scheduled": "bg-interview-scheduled",
  "Final decision pending": "bg-final-decision-pending",
  Denied: "bg-rejected",
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};

const ApplicationsTable = ({ applications, onReview, onDelete }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  const handleDeleteClick = (application) => {
    setApplicationToDelete(application);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (applicationToDelete && onDelete) {
      onDelete(applicationToDelete.UID);
    }
    setDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  const columns = [
    {
      name: "Listing",
      selector: (row) => row.posting.title,
      sortable: true,
      wrap: true,
      minWidth: "150px",
      center: true,
      cell: (row) => (
        <span className="fs-6">
          <a className="text-black" href={`/listing/${row.posting.UID}`}>
            {row.posting.title}
          </a>
        </span>
      ),
    },
    {
      name: "Company",
      selector: (row) => row.posting.company.name,
      sortable: true,
      wrap: true,
      minWidth: "120px",
      center: true,
      cell: (row) => (
        <span className="fs-6">
          <a className="text-black" href={`/company/${row.posting.company.public_key}`}>
            {row.posting.company.name}
          </a>
        </span>
      ),
    },
    {
      name: "Date Applied",
      selector: (row) => row.applied_at,
      sortable: true,
      wrap: true,
      minWidth: "120px",
      center: true,
      cell: (row) => <span className="fs-6">{formatDate(row.applied_at)}</span>,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      wrap: true,
      minWidth: "140px",
      center: true,
      cell: (row) => (
        <span
          className={`badge unround ${
            statusClassMap[row.status] || "bg-light-gray"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Operations",
      center: true,
      cell: (row) => (
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
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      minWidth: "180px",
    },
  ];

  const customStyles = {
    tableWrapper: {
      style: {
        display: "block",
        overflowX: "auto",
        border: "1px solid #000",
        borderRadius: "0.25rem",
      },
    },
    table: {
      style: {
        borderBottom: "none",
      },
    },
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        whiteSpace: "normal",
        wordWrap: "break-word",
        textAlign: "center",
        borderBottom: "1px solid #000",
      },
    },
    cells: {
      style: {
        whiteSpace: "normal",
        wordWrap: "break-word",
        paddingTop: "0.6rem",
        paddingBottom: "0.6rem",
        textAlign: "center",
        borderBottom: "1px solid #000",
      },
    },
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={applications}
        pagination
        defaultSortField="id"
        defaultSortAsc={false}
        fixedHeader
        fixedHeaderScrollHeight="80vh"
        responsive
        customStyles={customStyles}
      />
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        message={`Are you sure you want to delete your application for "${applicationToDelete?.posting?.title}" at ${applicationToDelete?.posting?.company?.name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default ApplicationsTable;