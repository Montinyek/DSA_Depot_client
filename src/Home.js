import React, { useContext } from 'react'
import { useState, useEffect } from 'react'
import Axios from 'axios'
import { Link } from 'react-router-dom'
import './table.css'
import './App.css'
import { LoginModal } from './LoginModal.js'
import { DeleteModal } from './DeleteModal'
import { EditorContext } from './EditorContext'
import { SiJavascript } from '@icons-pack/react-simple-icons'
import { SiPython } from '@icons-pack/react-simple-icons'
import { FaJava } from "react-icons/fa"
import { FaTrashAlt } from "react-icons/fa"
import { FaLock } from "react-icons/fa"
import { FaLongArrowAltRight } from "react-icons/fa"
import { FaLongArrowAltLeft } from "react-icons/fa"

export const Home = () => {
  const { urls, setUrls } = useContext(EditorContext)
  const { admin, setAdmin } = useContext(EditorContext)
  const [loginInput, setLoginInput] = useState("")
  const [filterVal, setFilterVal] = useState("")
  const [list, setList] = useState("")
  const [displayedList, setDisplayedList] = useState('')
  const [searchBy, setSearchBy] = useState("title")
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const { page, setPage } = useContext(EditorContext)
  const [openLogin, setOpenLogin] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const [deleted, setDeleted] = useState(false)
  const { setSnippetDetails } = useContext(EditorContext)
  const { setSnippetId } = useContext(EditorContext)

  useEffect(() => {
    setSnippetDetails({ title: "Untitled", code: " ", createdOn: " ", updatedOn: " ", lang: "JavaScript", tags: [] })
    setSnippetId("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    Axios.get("http://localhost:3001/").then(res => { setList(res.data); setDisplayedList(res.data); setDeleted(false) })
  }, [deleted])

  useEffect(() => {
    localStorage.setItem("admin", admin ? "true" : "false")
  }, [admin])

  function handleLogin(event) {
    setLoginInput(event.target.value)
  }

  const login = () => {
    Axios.post("http://localhost:3001/login", { input: loginInput }).then(res => { setUrls(res.data); localStorage.setItem("URLS", JSON.stringify(res.data)); setAdmin(true); setOpenLogin(false); setLoginInput("") }).catch(err => console.log(err))
  }

  const deleteSnippet = () => {
    Axios.delete(`http://localhost:3001/${urls.deleteSnippet}/${deleteId}`).then(res => console.log(res.data))
  }

  function filterState() {
    if (filterVal.trim()) {
      let filtered = searchBy === "title"
        ?
        list.filter(a => filterVal.trim().split(' ').map(val => val.toLowerCase()).filter(Boolean).some(b => a.title.split(' ').map(val => val.toLowerCase()).includes(b)))
        :
        list.filter(a => filterVal.trim().split(' ').map(val => val.toLowerCase()).filter(Boolean).some(b => a.tags.includes(b)))
      setDisplayedList(filtered)
      setFilterVal(filterVal.trim())
      console.log(displayedList.length)
    } else {
      setDisplayedList(list)
      setFilterVal("")
    }
  }

  function handleSearch(e) {
    setFilterVal(e.target.value)
  }

  function sliceList(list) {
    return list.slice((7 * page) - 7, 7 * page)
  }

  function getIcon(lang) {
    if (lang === "JavaScript") {
      return <SiJavascript />
    } else if (lang === "Python") {
      return <SiPython />
    } else if (lang === "Java") {
      return <FaJava />
    }
  }

  return (
    <>
      <LoginModal open={openLogin} close={() => { setOpenLogin(false); setLoginInput("") }}>
          <div style={{fontSize: "2rem", color: "#F1EDEE"}}>Admin only</div>
          <input type="text" value={loginInput} onChange={handleLogin} style={{ border: "none", outline: "none", borderRadius: "5px", fontSize: "1.1rem", padding: "5px 5px 5px 10px" }} />
          <button onClick={login} style={{ width: "60%" }}>Enter</button>
      </LoginModal>
      <DeleteModal open={openDelete} close={() => setOpenDelete(false)}>
        <span style={{fontSize: "1.4rem", color: "#F1EDEE"}}>Delete?</span>
        <button onClick={() => { deleteSnippet(); setOpenDelete(false); setDeleted(true) }} style={{ width: "60%" }}>Confirm</button>
      </DeleteModal>
      <div className="login-and-editor-btn">
      {admin && <Link to="/editor" onClick={() => localStorage.setItem("openedSnippet", "")}><button>Editor</button></Link>}
      {!admin ? <button onClick={() => setOpenLogin(true)}>Login</button> : <button onClick={() => setAdmin(false)}>Logout</button>}
      </div>

      <div>
        <div className="search">
          <input type="string" value={filterVal} onChange={handleSearch} />
          <div className="searchBy">
            <span onClick={filterState}>Search by {searchBy === "title" ? "title" : "tags"}</span>
            <span onClick={() => setDropdownVisible(prev => !prev)}>
              <i className={`fa-solid fa-caret-down ${dropdownVisible ? 'arrowUp' : ''}`}></i>
            </span>
            <ul style={dropdownVisible ? { opacity: 1, visiblity: "visible" } : { opacity: 0, visiblity: "hidden" }}>
              <li onClick={() => { setSearchBy("title"); setDropdownVisible(false) }} style={searchBy === "title" ? { opacity: 0.5, pointerEvents: "none" } : { opacity: 1 }}>title</li>
              <li onClick={() => { setSearchBy("tags"); setDropdownVisible(false) }} style={searchBy === "tags" ? { opacity: 0.5, pointerEvents: "none" } : { opacity: 1 }}>tags</li>
            </ul>
          </div>
        </div>


        {displayedList && <table>
          <tbody>
            {sliceList(displayedList).slice(0, 7).map((snippet, i) => {
              let id = page === 1 ? i : 7 * (page - 1) + i

              return (<tr key={i}>
                <td>
                  <Link onClick={() => { localStorage.setItem("openedSnippet", JSON.stringify(displayedList[id])); localStorage.setItem("snippetId", displayedList[id]._id); setSnippetDetails(displayedList[id]); setSnippetId(displayedList[id]._id) }} to="/editor">{snippet.title}</Link>
                </td>

                <td className="lang-icon">
                  {getIcon(snippet.lang)}
                </td>

                <td>
                  <span className="createdOn">{snippet.createdOn}</span>
                </td>

                <td>
                  <span className="updatedOn">{snippet.updatedOn}</span>
                </td>

                <td className="lang-icon2">
                  {getIcon(snippet.lang)}
                </td>

                <td>
                  {!admin ? <FaLock style={{ opacity: "0.6" }} /> : <FaTrashAlt style={{ cursor: "pointer" }} onClick={() => { setOpenDelete(true); setDeleteId(displayedList[id]._id) }} />}
                </td>
              </tr>)
            })}
          </tbody>
        </table>}
      </div>
      
      {displayedList.length === 0 && <div className="nothing-2-display">Nothing to display...</div>}

      <div className="page-controls">
          <button disabled={page === 1} onClick={() => {setPage(prev => prev > 1 ? prev - 1 : 1); localStorage.setItem("page", +page - 1)}}><FaLongArrowAltLeft /></button>
          <button disabled={7 * page >= displayedList.length} onClick={() => {setPage(prev => 7 * page < displayedList.length ? prev + 1 : prev); localStorage.setItem("page", +page + 1)}}><FaLongArrowAltRight /></button>
        </div>
    </>
  );
}
