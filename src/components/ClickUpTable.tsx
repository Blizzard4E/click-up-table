"use client";
import {
	DataGrid,
	GridColDef,
	GridRenderCellParams,
	GridRowSelectionModel,
	GridRowId,
} from "@mui/x-data-grid";
import {
	Box,
	Chip,
	Link,
	Select,
	MenuItem,
	FormControl,
	Button,
	Drawer,
	TextField,
	Typography,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormLabel,
	IconButton,
	Toolbar,
	Autocomplete,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useState, useCallback, useMemo } from "react";
import TableTextField from "./Table/TableTextField";

interface ClickUpTable {
	id: string;
	name: string;
	headers: Header[];
	rows: Column[][];
}

interface Header {
	label: string;
	type: "text" | "dropdown" | "tags" | "link" | "email";
}

interface Column {
	id: string;
	content: string | Tag[] | Option;
}

interface Tag {
	id: string;
	name: string;
}

interface Option {
	id: string;
	name: string;
}

// Preset dropdown options
const DROPDOWN_OPTIONS = [
	"Dropdown Option 1",
	"Dropdown Option 2",
	"Dropdown Option 3",
	"In Progress",
	"Completed",
	"Pending",
	"Cancelled",
];

// Preset tag options
const TAG_OPTIONS = [
	"Tag1",
	"Tag2",
	"Tag3",
	"Tag4",
	"Tag5",
	"Priority",
	"Bug",
	"Feature",
	"Enhancement",
	"Documentation",
];

const initialTestData: ClickUpTable = {
	id: "123",
	name: "Test Table",
	headers: [
		{ label: "Name", type: "text" },
		{ label: "Dropdown", type: "dropdown" },
		{ label: "Tags", type: "tags" },
		{ label: "Links", type: "link" },
		{ label: "Email", type: "email" },
	],
	rows: [
		[
			{ id: "1-1", content: "Row 1 Name" },
			{ id: "1-2", content: "Dropdown Option 1" },
			{ id: "1-3", content: "Tag1, Tag2" },
			{ id: "1-4", content: "https://example.com" },
			{ id: "1-5", content: "row1@example.com" },
		],
		[
			{ id: "2-1", content: "Row 2 Name" },
			{ id: "2-2", content: "In Progress" },
			{ id: "2-3", content: "Tag3" },
			{ id: "2-4", content: "https://test.com" },
			{ id: "2-5", content: "row2@example.com" },
		],
		[
			{ id: "3-1", content: "Row 3 Name" },
			{ id: "3-2", content: "Completed" },
			{ id: "3-3", content: "Tag4, Tag5" },
			{ id: "3-4", content: "https://demo.com" },
			{ id: "3-5", content: "row3@example.com" },
		],
	],
};

const renderTextCell = (params: GridRenderCellParams) => (
	<TableTextField text={params.value as string} />
);

import { SelectChangeEvent } from "@mui/material/Select";

const renderDropdownCell = (
	params: GridRenderCellParams,
	updateCell: (rowIndex: number, colIndex: number, value: string) => void
) => {
	const handleChange = (event: SelectChangeEvent) => {
		const rowIndex = parseInt(params.id as string);
		const colIndex = parseInt(params.field.replace("col_", ""));
		updateCell(rowIndex, colIndex, event.target.value);
	};

	return (
		<FormControl size="small" sx={{ minWidth: 120, width: "100%" }}>
			<Select
				value={params.value as string}
				onChange={handleChange}
				displayEmpty
				sx={{
					"& .MuiSelect-select": {
						padding: "4px 8px",
						fontSize: "0.875rem",
					},
					"& .MuiOutlinedInput-notchedOutline": {
						border: "none",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						border: "1px solid rgba(0, 0, 0, 0.23)",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						border: "2px solid #1976d2",
					},
				}}
			>
				{DROPDOWN_OPTIONS.map((option) => (
					<MenuItem key={option} value={option}>
						{option}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

const renderTagsCell = (
	params: GridRenderCellParams,
	updateCell: (rowIndex: number, colIndex: number, value: string) => void
) => {
	const currentTags = (params.value as string)
		.split(", ")
		.filter((tag) => tag.trim() !== "");

	const handleTagChange = (
		event: React.SyntheticEvent<Element, Event>,
		newValue: string[]
	) => {
		const rowIndex = parseInt(params.id as string);
		const colIndex = parseInt(params.field.replace("col_", ""));
		updateCell(rowIndex, colIndex, newValue.join(", "));
	};

	return (
		<Box sx={{ width: "100%" }}>
			<Autocomplete
				multiple
				options={TAG_OPTIONS}
				value={currentTags}
				onChange={handleTagChange}
				freeSolo
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<Chip
							{...getTagProps({ index })}
							key={index}
							label={option}
							size="small"
							sx={{
								fontSize: "0.75rem",
								backgroundColor: `hsl(${
									(index * 60) % 360
								}, 70%, 50%)`,
								color: "white",
								"& .MuiChip-deleteIcon": {
									color: "white",
								},
							}}
						/>
					))
				}
				renderInput={(params) => (
					<TextField
						{...params}
						variant="outlined"
						placeholder="Search or type to create new option"
						size="small"
						sx={{
							"& .MuiOutlinedInput-root": {
								padding: "4px 8px",
								minHeight: "auto",
								"& .MuiOutlinedInput-notchedOutline": {
									border: "1px solid rgba(0, 0, 0, 0.23)",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									border: "1px solid rgba(0, 0, 0, 0.87)",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline":
									{
										border: "2px solid #1976d2",
									},
							},
							"& .MuiInputBase-input": {
								fontSize: "0.875rem",
								padding: "2px 4px !important",
							},
						}}
					/>
				)}
				renderOption={(props, option) => {
					const { key, ...optionProps } = props;
					return (
						<Box
							key={key}
							component="li"
							{...optionProps}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								padding: "8px 12px",
							}}
						>
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									backgroundColor: `hsl(${
										(TAG_OPTIONS.indexOf(option) * 60) % 360
									}, 70%, 50%)`,
								}}
							/>
							{option}
						</Box>
					);
				}}
				sx={{
					"& .MuiAutocomplete-inputRoot": {
						flexWrap: "wrap",
						gap: 0.5,
					},
				}}
			/>
		</Box>
	);
};

const renderLinkCell = (params: GridRenderCellParams) => (
	<Link
		href={params.value as string}
		target="_blank"
		rel="noopener noreferrer"
		sx={{ textDecoration: "none" }}
	>
		{params.value as string}
	</Link>
);

const renderEmailCell = (params: GridRenderCellParams) => (
	<Link href={`mailto:${params.value}`} sx={{ textDecoration: "none" }}>
		{params.value as string}
	</Link>
);

// Removed AddColumnCell component - no longer needed

export default function ClickUpTable() {
	const [tableData, setTableData] = useState<ClickUpTable>(initialTestData);
	const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>({
		type: "include",
		ids: new Set<GridRowId>(),
	});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [newColumnLabel, setNewColumnLabel] = useState("");
	const [newColumnType, setNewColumnType] = useState<
		"text" | "dropdown" | "tags" | "link" | "email"
	>("text");

	const updateCell = useCallback(
		(rowIndex: number, colIndex: number, value: string) => {
			setTableData((prev) => ({
				...prev,
				rows: prev.rows.map((row, rIdx) =>
					rIdx === rowIndex
						? row.map((col, cIdx) =>
								cIdx === colIndex
									? { ...col, content: value }
									: col
						  )
						: row
				),
			}));
		},
		[]
	);

	const getDefaultValueForType = (type: string): string => {
		switch (type) {
			case "text":
				return "";
			case "dropdown":
				return DROPDOWN_OPTIONS[0];
			case "tags":
				return "";
			case "link":
				return "https://";
			case "email":
				return "";
			default:
				return "";
		}
	};

	const addRow = () => {
		const newRowIndex = tableData.rows.length;
		const newRow: Column[] = tableData.headers.map((header, colIndex) => ({
			id: `${newRowIndex + 1}-${colIndex + 1}`,
			content: getDefaultValueForType(header.type),
		}));

		setTableData((prev) => ({
			...prev,
			rows: [...prev.rows, newRow],
		}));
	};

	const addColumn = () => {
		if (!newColumnLabel.trim()) return;

		const newHeader: Header = {
			label: newColumnLabel,
			type: newColumnType,
		};

		const defaultValue = getDefaultValueForType(newColumnType);

		setTableData((prev) => ({
			...prev,
			headers: [...prev.headers, newHeader],
			rows: prev.rows.map((row, rowIndex) => [
				...row,
				{
					id: `${rowIndex + 1}-${prev.headers.length + 1}`,
					content: defaultValue,
				},
			]),
		}));

		setNewColumnLabel("");
		setNewColumnType("text");
		setDrawerOpen(false);
	};

	const deleteSelectedRows = () => {
		const selectedRowIndices = Array.from(selectedRows.ids).map((id) =>
			parseInt(id.toString())
		);
		setTableData((prev) => ({
			...prev,
			rows: prev.rows.filter(
				(_, index) => !selectedRowIndices.includes(index)
			),
		}));
		setSelectedRows({
			type: "include",
			ids: new Set<GridRowId>(),
		});
	};

	// Transform headers into DataGrid columns with Add Column button
	const columns: GridColDef[] = useMemo(() => {
		const dataColumns: GridColDef[] = tableData.headers.map(
			(header, index) => ({
				field: `col_${index}`,
				headerName: header.label,
				width: 300,
				renderCell: (params: GridRenderCellParams) => {
					// Check if this is the "Add Row" row
					if (params.id === "add_row") {
						// Only show the + button in the first column for "Add Row"
						if (index === 0) {
							return (
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-start",
										width: "100%",
										cursor: "pointer",
										color: "text.secondary",
										"&:hover": {
											color: "primary.main",
										},
									}}
									onClick={addRow}
								>
									<Add sx={{ mr: 1, fontSize: "1rem" }} />
									<Typography
										variant="body2"
										sx={{ fontStyle: "italic" }}
									>
										Add Row
									</Typography>
								</Box>
							);
						}
						// Empty cells for other columns in the "Add Row" row
						return null;
					}

					// Normal cell rendering for data rows
					switch (header.type) {
						case "text":
							return renderTextCell(params);
						case "dropdown":
							return renderDropdownCell(params, updateCell);
						case "tags":
							return renderTagsCell(params, updateCell);
						case "link":
							return renderLinkCell(params);
						case "email":
							return renderEmailCell(params);
						default:
							return renderTextCell(params);
					}
				},
			})
		);

		// Add the "Add Column" header column (blends with table, header only)
		const addColumnCol: GridColDef = {
			field: "add_column",
			headerName: "",
			width: 120,
			sortable: false,
			filterable: false,
			disableColumnMenu: true,
			renderCell: () => {
				// Empty cells - no buttons in data rows or add row
				return null;
			},
			renderHeader: () => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
						height: "100%",
						width: "100%",
						cursor: "pointer",
						color: "text.secondary",
						"&:hover": {
							color: "primary.main",
						},
					}}
					onClick={() => setDrawerOpen(true)}
				>
					<Add sx={{ mr: 1, fontSize: "1rem" }} />
					<Typography variant="body2" sx={{ fontStyle: "italic" }}>
						Add Column
					</Typography>
				</Box>
			),
		};

		return [...dataColumns, addColumnCol];
	}, [tableData.headers, updateCell, addRow]);

	// Transform rows into DataGrid format with empty cell for add column + Add Row as last row
	const rows = useMemo(() => {
		const dataRows = tableData.rows.map((row, rowIndex) => {
			const rowData: Record<string, string> = {
				id: rowIndex.toString(),
			};
			row.forEach((column, colIndex) => {
				rowData[`col_${colIndex}`] = column.content as string;
			});
			// Add empty value for the add column button column
			rowData["add_column"] = "";
			return rowData;
		});

		// Add the "Add Row" row as the last row
		const addRowData: Record<string, string> = {
			id: "add_row",
		};
		tableData.headers.forEach((_, colIndex) => {
			addRowData[`col_${colIndex}`] = "";
		});
		addRowData["add_column"] = "";

		return [...dataRows, addRowData];
	}, [tableData.rows, tableData.headers]);

	return (
		<Box sx={{ width: "100%" }}>
			{/* Top toolbar with only delete button */}
			<Toolbar sx={{ mb: 2, pl: 0, justifyContent: "flex-start" }}>
				{selectedRows.ids.size > 0 && (
					<Button
						variant="outlined"
						color="error"
						onClick={deleteSelectedRows}
					>
						Delete Selected ({selectedRows.ids.size})
					</Button>
				)}
			</Toolbar>

			{/* DataGrid with sticky Add Column button */}
			<Box sx={{ height: 500, width: "100%", position: "relative" }}>
				<DataGrid
					rows={rows}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: 10,
							},
						},
					}}
					pageSizeOptions={[5, 10, 25]}
					checkboxSelection
					rowSelectionModel={selectedRows}
					onRowSelectionModelChange={(newSelection) => {
						// Filter out the "add_row" id from selection
						const filteredSelection = {
							...newSelection,
							ids: new Set(
								Array.from(newSelection.ids).filter(
									(id) => id !== "add_row"
								)
							),
						};
						setSelectedRows(filteredSelection);
					}}
					isRowSelectable={(params) => params.id !== "add_row"}
					getRowClassName={(params) =>
						params.id === "add_row" ? "add-row" : ""
					}
					onCellClick={(params) => {
						// Prevent any cell clicks on the add row
						if (params.id === "add_row") {
							return;
						}
					}}
					sx={{
						"& .MuiDataGrid-cell": {
							display: "flex",
							alignItems: "center",
						},
						"& .MuiDataGrid-columnHeader:last-child": {
							position: "sticky",
							right: 0,
							backgroundColor: "background.paper",
							zIndex: 1,
							borderLeft: "1px solid rgba(224, 224, 224, 1)",
						},
						"& .MuiDataGrid-cell:last-child": {
							position: "sticky",
							right: 0,
							backgroundColor: "background.paper",
							zIndex: 1,
							borderLeft: "1px solid rgba(224, 224, 224, 1)",
						},
						// Style the "Add Row" row differently and make it completely non-interactive
						"& .add-row": {
							backgroundColor: "rgba(0, 0, 0, 0.02)",
							"&:hover": {
								backgroundColor: "rgba(0, 0, 0, 0.04)",
							},
						},
						// Hide checkbox for add row and make entire row non-selectable
						"& .add-row .MuiCheckbox-root": {
							display: "none",
						},
						"& .add-row .MuiDataGrid-cellCheckbox": {
							pointerEvents: "none",
						},
						"& .add-row .MuiDataGrid-cell": {
							pointerEvents: "none",
							userSelect: "none",
						},
						// Only allow clicking on the first cell (with + Add Row text)
						"& .add-row .MuiDataGrid-cell:first-of-type": {
							pointerEvents: "auto",
							cursor: "pointer",
						},
					}}
				/>
			</Box>

			{/* Add Row button below the table */}
			{/* Removed - Add Row is now integrated as the last row in the table */}

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				sx={{
					"& .MuiDrawer-paper": {
						width: 400,
						p: 3,
					},
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Typography variant="h6">Add New Column</Typography>
					<IconButton onClick={() => setDrawerOpen(false)}>
						<Close />
					</IconButton>
				</Box>

				<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
					<TextField
						label="Column Label"
						value={newColumnLabel}
						onChange={(e) => setNewColumnLabel(e.target.value)}
						fullWidth
						variant="outlined"
					/>

					<FormControl component="fieldset">
						<FormLabel component="legend">Column Type</FormLabel>
						<RadioGroup
							value={newColumnType}
							onChange={(e) =>
								setNewColumnType(
									e.target.value as
										| "text"
										| "dropdown"
										| "tags"
										| "link"
										| "email"
								)
							}
						>
							<FormControlLabel
								value="text"
								control={<Radio />}
								label="Text"
							/>
							<FormControlLabel
								value="dropdown"
								control={<Radio />}
								label="Dropdown"
							/>
							<FormControlLabel
								value="tags"
								control={<Radio />}
								label="Tags"
							/>
							<FormControlLabel
								value="link"
								control={<Radio />}
								label="Link"
							/>
							<FormControlLabel
								value="email"
								control={<Radio />}
								label="Email"
							/>
						</RadioGroup>
					</FormControl>

					<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
						<Button
							variant="contained"
							onClick={addColumn}
							disabled={!newColumnLabel.trim()}
							fullWidth
						>
							Add Column
						</Button>
						<Button
							variant="outlined"
							onClick={() => setDrawerOpen(false)}
							fullWidth
						>
							Cancel
						</Button>
					</Box>
				</Box>
			</Drawer>
		</Box>
	);
}
