default:
	@echo "transpiling es6..."
	@cat app.es6 | ./node_modules/.bin/babel --optional runtime > app.js
