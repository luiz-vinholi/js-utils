const later = (delay) => {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay)
  })
}

const retry = async (callback, totalRetries, delay) => {
	let count = 0
  const retryFunc = async () => {
  	try {
    	const result = await callback()
      return result
    } catch (err) {
    	if (count < totalRetries) {
      	count += 1
        await later(delay)
			  return retryFunc()
      }
      throw err
    }
  }
  return retryFunc()
}
