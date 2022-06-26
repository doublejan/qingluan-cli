const fs = require('fs');


exports.exists = async (path) => {
  try {
		await fs.Promises.access(path);
		return true;
	} catch {
		return false;
	}
}

exports.existsSync = (path) => {
  try {
		fs.accessSync(path);
		return true;
	} catch {
		return false;
	}
}
