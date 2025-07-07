import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ReactScan } from "@/components/ReactScan";

export default function RootLayout(props: React.PropsWithChildren) {
	return (
		<html lang="en">
			<ReactScan />
			<body>
				<CssBaseline />
				<AppRouterCacheProvider>
					<Box sx={{ p: "2rem" }}>{props.children}</Box>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
