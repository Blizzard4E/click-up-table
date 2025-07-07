"use client";
import Box from "@mui/material/Box";
import { useState, useRef, useEffect } from "react";

export default function TableTextField({ text }: { text: string }) {
	const [isSelected, setIsSelected] = useState(false);
	const [value, setValue] = useState(text);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isSelected && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isSelected]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === "Escape") {
			setIsSelected(false);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				width: "100%",
				minHeight: "24px",
				cursor: isSelected ? "text" : "pointer",
			}}
			onClick={() => {
				if (!isSelected) {
					setIsSelected(true);
				}
			}}
		>
			{isSelected ? (
				<input
					ref={inputRef}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={() => setIsSelected(false)}
					onKeyDown={handleKeyDown}
					style={{
						width: "100%",
						border: "none",
						outline: "none",
						background: "transparent",
						fontSize: "inherit",
						fontFamily: "inherit",
						color: "inherit",
						padding: "0",
						margin: "0",
						minHeight: "24px",
					}}
				/>
			) : (
				<span
					style={{
						width: "100%",
						minHeight: "24px",
						display: "flex",
						alignItems: "center",
					}}
				>
					{value || "\u00A0"}{" "}
					{/* Non-breaking space for empty values */}
				</span>
			)}
		</Box>
	);
}
