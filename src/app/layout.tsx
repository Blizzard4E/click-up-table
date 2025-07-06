import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export default function RootLayout(props: React.PropsWithChildren) {
	return (
		<html lang="en">
			<body>
				<CssBaseline />
				<AppRouterCacheProvider>
					{props.children}
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
