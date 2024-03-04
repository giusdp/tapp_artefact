function sleep(params) {
	return new Promise(resolve => {
    setTimeout(
      () => resolve(
        {
          'payload': `Slept for ${params.duration || 1000}`
        }
      ),
      params.duration || 1000)
  })
}

exports.main = sleep;
