import React, { useState } from "react";
import DataTable from "react-data-table-component";
import ConfirmDeleteModal from "../../modals/ConfirmDeleteModal";

const statusClassMap = {
  Active: "bg-active",
  Archived: "bg-unopened",
  Closed: "bg-black text-white",
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};

const WatchlistTable = ({ watchlistItems, onUnwatch }) => {
  const [unwatchModalOpen, setUnwatchModalOpen] = useState(false);
  const [itemToUnwatch, setItemToUnwatch] = useState(null);

  const handleUnwatchClick = (item) => {
    setItemToUnwatch(item);
    setUnwatchModalOpen(true);
  };

  const handleConfirmUnwatch = () => {
    if (itemToUnwatch && onUnwatch) {
      onUnwatch(itemToUnwatch.posting.UID);
    }
    setUnwatchModalOpen(false);
    setItemToUnwatch(null);
  };

  const handleCancelUnwatch = () => {
    setUnwatchModalOpen(false);
    setItemToUnwatch(null);
  };

  const columns = [
    {
      name: "Operations",
      center: true,
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-danger unround border border-1 border-black"
            onClick={(e) => {
              e.stopPropagation();
              handleUnwatchClick(row);
            }}
          >
            <i className="fa-solid fa-eye-slash"></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      minWidth: "180px",
    },
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
      name: "Date Added",
      selector: (row) => row.added_at,
      sortable: true,
      wrap: true,
      minWidth: "120px",
      center: true,
      cell: (row) => <span className="fs-6">{formatDate(row.added_at)}</span>,
    },
    {
      name: "Status",
      selector: (row) => row.posting.status,
      sortable: true,
      wrap: true,
      minWidth: "140px",
      center: true,
      cell: (row) => (
        <span
          className={`badge unround ${
            statusClassMap[row.posting.status] || "bg-light-gray"
          }`}
        >
          {row.posting.status}
        </span>
      ),
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
        data={watchlistItems}
        pagination
        defaultSortField="id"
        defaultSortAsc={false}
        fixedHeader
        fixedHeaderScrollHeight="500px"
        responsive
        customStyles={customStyles}
      />
      <ConfirmDeleteModal
        isOpen={unwatchModalOpen}
        title="Confirm Unwatch?"
        message={`Are you sure you want to remove "${itemToUnwatch?.posting?.title}" at ${itemToUnwatch?.posting?.company?.name} from your watchlist?`}
        confirmText="Yes, Unwatch"
        onConfirm={handleConfirmUnwatch}
        onCancel={handleCancelUnwatch}
      />
    </>
  );
};

export default WatchlistTable;
