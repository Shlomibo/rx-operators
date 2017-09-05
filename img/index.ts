function requireAll(r: any) {
	r.keys().forEach(r);
}
requireAll(require['context']('./', true, /\.png$/));
