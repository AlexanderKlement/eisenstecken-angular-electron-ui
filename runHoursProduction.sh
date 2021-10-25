echo "Build Project with 'ng build -c web'"
npx ng build -c web
echo "Build sucessfull, serve dist folder on port 4200 with 'serve -s -p 4200 dist/'"
npx serve -s -p 4200 dist/
