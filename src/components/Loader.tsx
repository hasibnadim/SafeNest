import React from 'react'

interface ILoaderProps {
    isLoading: boolean,
    children: React.ReactNode
}
const Loader = (props: ILoaderProps) => {
    if (props.isLoading)
        return (
            <div className="flex items-center justify-center w-full h-full min-h-screen">
                <span className="relative flex h-10 w-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40 dark:bg-blue-400"></span>
                    <div className="animate-spin rounded-full h-10 w-10  border-b-2 border-purple-400 mx-auto border-opacity-60"></div>
                </span>
            </div>
        )
    else
        return props.children
}

export default Loader