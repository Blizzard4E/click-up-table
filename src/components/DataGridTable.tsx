"use client";
import { useState, useEffect, useRef } from "react";
import {
	DataGrid,
	GridColDef,
	GridRowsProp,
	GridRowSelectionModel,
	GridRowId,
} from "@mui/x-data-grid";
import {
	Box,
	Button,
	Drawer,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	IconButton,
	Chip,
	Stack,
	Divider,
	Paper,
	Alert,
} from "@mui/material";
import {
	Add as AddIcon,
	Close as CloseIcon,
	Delete as DeleteIcon,
	DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

const CELL_TYPES = [
	{ value: "string", label: "Text" },
	{ value: "number", label: "Number" },
	{ value: "date", label: "Date" },
	{ value: "dateTime", label: "Date Time" },
	{ value: "boolean", label: "Check" },
	{ value: "singleSelect", label: "Dropdown" },
];

// Preset columns configuration
const PRESET_COLUMNS: GridColDef[] = [
	{
		field: "name",
		headerName: "Name",
		type: "string",
		width: 150,
		editable: true,
	},
	{
		field: "age",
		headerName: "Age",
		type: "number",
		width: 100,
		editable: true,
	},
	{
		field: "email",
		headerName: "Email",
		type: "string",
		width: 200,
		editable: true,
	},
	{
		field: "department",
		headerName: "Department",
		type: "singleSelect",
		valueOptions: ["Engineering", "Marketing", "Sales", "HR", "Finance"],
		width: 150,
		editable: true,
	},
	{
		field: "start_date",
		headerName: "Start Date",
		type: "date",
		width: 130,
		editable: true,
	},
	{
		field: "active",
		headerName: "Active",
		type: "boolean",
		width: 100,
		editable: true,
	},
];

// Preset rows data
const PRESET_ROWS: GridRowsProp = [
	{
		id: "1",
		name: "John Doe",
		age: 30,
		email: "john.doe@company.com",
		department: "Engineering",
		start_date: new Date("2022-01-15"),
		active: true,
	},
	{
		id: "2",
		name: "Jane Smith",
		age: 28,
		email: "jane.smith@company.com",
		department: "Marketing",
		start_date: new Date("2021-11-08"),
		active: true,
	},
	{
		id: "3",
		name: "Bob Johnson",
		age: 35,
		email: "bob.johnson@company.com",
		department: "Sales",
		start_date: new Date("2020-06-22"),
		active: false,
	},
	{
		id: "4",
		name: "Alice Brown",
		age: 26,
		email: "alice.brown@company.com",
		department: "HR",
		start_date: new Date("2023-03-10"),
		active: true,
	},
];

export default function DynamicDataGrid() {
	const [columns, setColumns] = useState<GridColDef[]>(PRESET_COLUMNS);
	const [rows, setRows] = useState<GridRowsProp>(PRESET_ROWS);
	const [rowSelectionModel, setRowSelectionModel] =
		useState<GridRowSelectionModel>({
			type: "include",
			ids: new Set<GridRowId>(),
		});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [newColumn, setNewColumn] = useState({
		field: "",
		headerName: "",
		type: "string",
		valueOptions: [] as string[],
	});
	const [newOption, setNewOption] = useState("");
	const [columnButtonPosition, setColumnButtonPosition] = useState({
		left: 0,
		fallback: false,
	});
	const dataGridRef = useRef<HTMLDivElement>(null);

	const generateRowId = () => {
		return uuidv4();
	};

	// Function to calculate button position based on last column header
	const calculateColumnButtonPosition = () => {
		if (!dataGridRef.current || columns.length === 0) {
			setColumnButtonPosition({ left: 0, fallback: true });
			return;
		}

		const lastColumnHeader = dataGridRef.current.querySelector(
			".MuiDataGrid-columnHeader--last"
		);
		const tableContainer =
			dataGridRef.current.querySelector(".MuiDataGrid-main");

		if (!lastColumnHeader || !tableContainer) {
			setColumnButtonPosition({ left: 0, fallback: true });
			return;
		}

		const headerRect = lastColumnHeader.getBoundingClientRect();
		const containerRect = tableContainer.getBoundingClientRect();

		// Calculate the position relative to the table container
		const relativeLeft = headerRect.right - containerRect.left;
		const containerWidth = containerRect.width;

		// Check if positioning the button next to the last column would cause overflow
		const buttonWidth = 40; // Approximate button width including margin
		const wouldOverflow = relativeLeft + buttonWidth > containerWidth;

		if (wouldOverflow) {
			// Fall back to right edge positioning
			setColumnButtonPosition({ left: 0, fallback: true });
		} else {
			// Position next to the last column
			setColumnButtonPosition({
				left: relativeLeft + 8,
				fallback: false,
			});
		}
	};

	// Effect to recalculate positions when columns/rows change or window resizes
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			calculateColumnButtonPosition();
		}, 100); // Small delay to ensure DataGrid has rendered

		const handleResize = () => {
			calculateColumnButtonPosition();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("resize", handleResize);
		};
	}, [columns, rows]);

	// Also recalculate when DataGrid might have been scrolled
	useEffect(() => {
		const dataGrid = dataGridRef.current;
		if (!dataGrid) return;

		const scrollContainer = dataGrid.querySelector(
			".MuiDataGrid-virtualScroller"
		);
		if (!scrollContainer) return;

		const handleScroll = () => {
			calculateColumnButtonPosition();
		};

		scrollContainer.addEventListener("scroll", handleScroll);
		return () =>
			scrollContainer.removeEventListener("scroll", handleScroll);
	}, [columns, rows]);

	const handleRowUpdate = (newRow: any) => {
		setRows((prev) => {
			const updatedRows = prev.map((row) =>
				row.id === newRow.id ? { ...newRow } : row
			);
			return [...updatedRows]; // Create new array to ensure proper re-render
		});
		return newRow;
	};

	const handleDeleteSelected = () => {
		if (rowSelectionModel.ids.size === 0) return;

		// Filter out selected rows and ensure we maintain proper structure
		setRows((prev) => {
			const filteredRows = prev.filter(
				(row) => !rowSelectionModel.ids.has(row.id)
			);
			return [...filteredRows]; // Create new array to trigger re-render
		});

		// Clear selection after deletion
		setRowSelectionModel({
			type: "include",
			ids: new Set<GridRowId>(),
		});
	};

	const addColumn = () => {
		if (!newColumn.field || !newColumn.headerName) {
			return;
		}

		// Check if column field already exists
		const fieldExists = columns.some(
			(col) => col.field === newColumn.field
		);
		if (fieldExists) {
			return; // Don't add duplicate column
		}

		const column: GridColDef = {
			field: newColumn.field,
			headerName: newColumn.headerName,
			type: newColumn.type as any,
			width: 150,
			editable: true,
		};

		// Add valueOptions for singleSelect
		if (
			newColumn.type === "singleSelect" &&
			newColumn.valueOptions.length > 0
		) {
			column.valueOptions = newColumn.valueOptions;
		}

		setColumns((prev) => [...prev, column]);

		// Update existing rows with new column
		setRows((prev) =>
			prev.map((row) => ({
				...row,
				[newColumn.field]: getDefaultValue(newColumn.type),
			}))
		);

		// Reset form
		setNewColumn({
			field: "",
			headerName: "",
			type: "string",
			valueOptions: [],
		});
		setNewOption("");
		setDrawerOpen(false);
	};

	const getDefaultValue = (type: string) => {
		switch (type) {
			case "number":
				return 0;
			case "boolean":
				return false;
			case "date":
				return new Date(); // Return actual Date object
			case "dateTime":
				return new Date(); // Return actual Date object for dateTime too
			default:
				return "";
		}
	};

	const addRow = () => {
		const newRowId = generateRowId();
		const newRow: any = {
			id: newRowId,
		};

		// Initialize all columns with default values
		columns.forEach((col) => {
			newRow[col.field] = getDefaultValue(col.type || "string");
		});

		setRows((prev) => [...prev, newRow]);
	};

	const addSelectOption = () => {
		if (
			newOption.trim() &&
			!newColumn.valueOptions.includes(newOption.trim())
		) {
			setNewColumn((prev) => ({
				...prev,
				valueOptions: [...prev.valueOptions, newOption.trim()],
			}));
			setNewOption("");
		}
	};

	const removeSelectOption = (optionToRemove: string) => {
		setNewColumn((prev) => ({
			...prev,
			valueOptions: prev.valueOptions.filter(
				(option) => option !== optionToRemove
			),
		}));
	};

	const handleFieldChange = (value: string) => {
		// Create a valid field name (no spaces, special chars)
		const field = value.toLowerCase().replace(/[^a-z0-9]/g, "_");
		setNewColumn((prev) => ({
			...prev,
			field,
			headerName: value,
		}));
	};

	// Check if the current field name already exists
	const isFieldNameTaken =
		newColumn.field && columns.some((col) => col.field === newColumn.field);

	return (
		<Box sx={{ height: "100%", width: "100%", p: 2 }}>
			<Typography variant="h4" gutterBottom>
				Dynamic MUI DataGrid
			</Typography>

			{/* Debug info */}
			<Paper sx={{ p: 2, mb: 2, backgroundColor: "#f5f5f5" }}>
				<Typography variant="subtitle2">Debug Info:</Typography>
				<Typography variant="body2">
					Total rows: {rows.length}
				</Typography>
				<Typography variant="body2">
					Total columns: {columns.length}
				</Typography>
				<Typography variant="body2">
					Selected rows: {rowSelectionModel.ids.size}
				</Typography>
				<Typography
					variant="body2"
					sx={{ fontFamily: "monospace", fontSize: "0.8em" }}
				>
					Rows data: {JSON.stringify(rows, null, 2)}
				</Typography>
			</Paper>

			<Stack direction="row" spacing={2} sx={{ mb: 2 }}>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setDrawerOpen(true)}
				>
					Add Column
				</Button>
				<Button
					variant="outlined"
					startIcon={<AddIcon />}
					onClick={addRow}
					disabled={columns.length === 0}
				>
					Add Row
				</Button>
				<Button
					variant="outlined"
					color="error"
					startIcon={<DeleteSweepIcon />}
					onClick={handleDeleteSelected}
					disabled={rowSelectionModel.ids.size === 0}
				>
					Delete Selected ({rowSelectionModel.ids.size})
				</Button>
			</Stack>

			{columns.length === 0 ? (
				<Paper sx={{ p: 4, textAlign: "center" }}>
					<Typography variant="h6" color="textSecondary">
						No columns defined
					</Typography>
					<Typography
						variant="body2"
						color="textSecondary"
						sx={{ mt: 1 }}
					>
						Click "Add Column" to get started
					</Typography>
				</Paper>
			) : (
				<Box
					sx={{ position: "relative", height: "100%" }}
					ref={dataGridRef}
				>
					<DataGrid
						rows={rows}
						columns={columns}
						showToolbar
						checkboxSelection
						disableRowSelectionOnClick
						hideFooter
						processRowUpdate={handleRowUpdate}
						rowSelectionModel={rowSelectionModel}
						onRowSelectionModelChange={(newRowSelectionModel) => {
							setRowSelectionModel(newRowSelectionModel);
						}}
						// Add these props to handle the data properly
						getRowId={(row) => row.id}
						experimentalFeatures={{ newEditingApi: true }}
						sx={{
							"& .MuiDataGrid-cell": {
								borderRight: 1,
								borderColor: "divider",
							},
						}}
					/>

					{/* Add Column Button - dynamically positioned */}
					<Button
						onClick={() => setDrawerOpen(true)}
						sx={{
							position: "absolute",
							top: "62px", // Position at header level
							...(columnButtonPosition.fallback
								? { right: "8px" } // Fall back to right edge
								: { left: `${columnButtonPosition.left}px` }), // Position next to last column
							zIndex: 1000,
							transition: "all 0.2s ease-in-out", // Smooth position transitions
							minWidth: 0,
							p: 1,
						}}
						size="small"
					>
						<AddIcon fontSize="small" />
					</Button>

					<Button
						variant="outlined"
						onClick={addRow}
						sx={{
							position: "absolute",
							bottom: rows.length > 0 ? "-50px" : "55px", // Position below last row or at bottom if no rows
							left: "0px", // Position below last row
							zIndex: 1000,
							transition: "all 0.2s ease-in-out", // Smooth position transitions
							minWidth: 0,
							p: "0.9rem",
						}}
						size="medium"
					>
						<AddIcon fontSize="small" />
					</Button>
				</Box>
			)}

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				PaperProps={{
					sx: { width: 400 },
				}}
			>
				<Box sx={{ p: 3 }}>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						sx={{ mb: 3 }}
					>
						<Typography variant="h6">Add New Column</Typography>
						<IconButton onClick={() => setDrawerOpen(false)}>
							<CloseIcon />
						</IconButton>
					</Stack>

					<Stack spacing={3}>
						<TextField
							label="Column Label"
							fullWidth
							value={newColumn.headerName}
							onChange={(e) => handleFieldChange(e.target.value)}
							helperText={
								isFieldNameTaken
									? "Field name already exists"
									: ""
							}
							error={!!isFieldNameTaken}
						/>

						<FormControl fullWidth>
							<InputLabel>Column Type</InputLabel>
							<Select
								value={newColumn.type}
								label="Column Type"
								onChange={(e) =>
									setNewColumn((prev) => ({
										...prev,
										type: e.target.value,
										valueOptions: [], // Reset options when type changes
									}))
								}
							>
								{CELL_TYPES.map((type) => (
									<MenuItem
										key={type.value}
										value={type.value}
									>
										{type.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{newColumn.type === "singleSelect" && (
							<Box>
								<Typography variant="subtitle2" sx={{ mb: 2 }}>
									Select Options
								</Typography>

								<Stack
									direction="row"
									spacing={1}
									sx={{ mb: 2 }}
								>
									<TextField
										label="Add option"
										size="small"
										value={newOption}
										onChange={(e) =>
											setNewOption(e.target.value)
										}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												addSelectOption();
											}
										}}
									/>
									<Button
										variant="outlined"
										onClick={addSelectOption}
										disabled={!newOption.trim()}
									>
										Add
									</Button>
								</Stack>

								<Box
									sx={{
										display: "flex",
										flexWrap: "wrap",
										gap: 1,
									}}
								>
									{newColumn.valueOptions.map(
										(option, index) => (
											<Chip
												key={index}
												label={option}
												onDelete={() =>
													removeSelectOption(option)
												}
												deleteIcon={<DeleteIcon />}
												size="small"
											/>
										)
									)}
								</Box>

								{newColumn.valueOptions.length === 0 && (
									<Alert severity="info" sx={{ mt: 1 }}>
										Add at least one option for the select
										column
									</Alert>
								)}
							</Box>
						)}

						<Divider />

						<Button
							variant="contained"
							onClick={addColumn}
							disabled={
								!newColumn.field ||
								!newColumn.headerName ||
								isFieldNameTaken ||
								(newColumn.type === "singleSelect" &&
									newColumn.valueOptions.length === 0)
							}
							fullWidth
						>
							Create Column
						</Button>
					</Stack>
				</Box>
			</Drawer>
		</Box>
	);
}
