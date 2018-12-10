function requireAll(r: any) {
	r.keys().forEach(r);
}
requireAll((require as any)['context']('./', true, /\.png$/));
